// 'use strict';
import { Tracing } from 'node-sleuth';


const debug = require('debug');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const _ = require('lodash');
const cors = require('cors');
const horizonSettings = require('./horizon-settings');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
if (process.env.JSON_LOGS) {
    //app.use(logger(':remote-addr - [:traceId] :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"')) // combined type with trace id
    app.use(logger('{"remoteAddr":":remote-addr","traceId":":traceId","remoteUser":":remote-user","date":":date[clf]","method":":method","url":":url","httpVersion":"HTTP/:http-version","httpStatus":":status","contentLength":":res[content-length]","referrer":":referrer","UserAgent":":user-agent"}')) // json logger
} else {
    app.use(logger('dev'));
}

app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'public')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/jquery/dist')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/jquery-migrate/dist')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/jquery.nicescroll/dist')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/bootstrap-slider/dist')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/bootstrap/dist/js')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/ddslick/dist')));
app.use('/assets/js', express.static(path.join(__dirname, '/../node_modules/lazysizes')));
app.use('/assets/css', express.static(path.join(__dirname, '/../node_modules/bootstrap/dist/css')));
app.use('/assets/toastr', express.static(path.join(__dirname, '/../node_modules/toastr/build')));
app.use('/assets/slick-carousel', express.static(path.join(__dirname, '/../node_modules/slick-carousel/slick')));
app.use('/assets/twilio-chat', express.static(path.join(__dirname, '/../node_modules/twilio-chat/dist')));
app.use('/assets/bootstrap-tagsinput', express.static(path.join(__dirname, '/../node_modules/bootstrap-tagsinput/dist')));
app.use('/scripts/', express.static(path.join(__dirname, 'scripts')));

const passport = require('passport');
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SECRET_KEY],
    maxAge: parseInt(process.env.SESSION_TIME_IN_SECOND, 10) * 1000
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

require('./passport');
app.use('/', require('./routes/main-routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send('<div>' + err.message + '</div>');
    });
}

Tracing.init({
    localServiceName: 'horizonfrontend'
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.sendFile(path.join(__dirname, '/views/error.html'));
});


app.use(async (ctx, next) => {
    const traceIdEjected = Tracing.ejector.eject(ctx);
    /**
     * if there isnot a traceId then generate a new TraceId
     */
    const rootTraceId = traceIdEjected.getOrElse(() => Tracing.tracer.createRootId());


    // set traceId into tracer for inject create children traceId
    Tracing.tracer.setId(rootTraceId);



    const span = new Span(rootTraceId);

    // put some thing into trace span
    span.setKind('SERVER');
    span.setName(`${app.config.name}${ctx.path}`);
    span.putTag('method', ctx.method);
    span.putTag('protocol', ctx.protocol);
    span.putTag('query', JSON.stringify(removeTFromQuery(ctx.queries)));
    span.putTag('body', JSON.stringify(ctx.request.body));

    span.setTimestamp(ctx.starttime * 1000);
    span.setRemoteEndpoint(new Endpoint({ ipv4: ctx.ip }));
    span.setLocalEndpoint(new Endpoint({ serviceName: app.config.name, ipv4: Tracing.ip, port: ctx.protocol === 'http' ? 80 : 443 })); // maybe is arbitrary

    try {
        await next();
        span.setDuration((Date.now() - ctx.starttime) * 1000);
        if (!ctx.body) {
            span.putTag('error', '1');
            span.putTag('NotFound', '1');
        } else {
            if (ctx.body.success === false || ctx.body.err || ctx.body.error || ctx.body.code !== 0) {
                span.putTag('error', '1');
            }
            span.putTag('result', JSON.stringify(ctx.body));
        }
        Tracing.logger.logSpan(span);
    } catch (error) {
        span.putTag('error', '1');
        if (error.code) {
            span.putTag('error_code', error.code);
        }
        if (error.message) {
            span.putTag('error_msg', error.message);
        }
        if (error.stack) {
            span.putTag('error_stack', error.stack);
        }
        Tracing.logger.logSpan(span);
        throw error;
    }
})

    logger.token('traceId', function getId (req) {
      return Tracing.tracer.id.traceId;
    })

app.set('port', process.env.PORT || 3000);

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

const server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
