import React, { useState, useEffect } from 'react';

const Popover = ({
	id = 'icon-popover',
	iconClass = 'icon-password-alerts',
	trigger = 'manual',
	content = '',
	placement = 'bottom',
	autoHideIcon = false,
	containerId = ''
}) => {
	const [hideIcon, setHideIcon] = useState(autoHideIcon);
	useEffect(() => {
		const genericCloseBtnHtml = `<span class="close" aria-hidden="true">&times;</span>`;
		$(`#${id}`).popover({
			trigger: trigger,
			html: true,
			title: genericCloseBtnHtml,
		}).on("mouseenter", function() {
			if (trigger === 'manual') {
				$(`#${id}`).popover("show");
				$(".popover").on("mouseleave", function() {
					$(`#${id}`).popover('hide');
				});
			}
		}).on("mouseleave", function() {
			if (trigger === 'manual') {
				setTimeout(function() {
					if (!$(".popover:hover").length) {
						$(`#${id}`).popover("hide");
					}
				}, 300);
			}
		});

		$(`#${id}`).on('shown.bs.popover', function () {
		  $('.close').on('click', function() {
				$(`#${id}`).popover('hide');
			});
		});
		$(`#${containerId}`)
			.on("mouseenter", function() {
				setHideIcon(false);
			})
			.on("mouseleave", function() {
				setTimeout(function() {
					if (!hideIcon) {
						setHideIcon(true);
					}
				}, 300);
			});
    });

	return (
		<i 
			id={id}
			className={`icon ${iconClass} ${hideIcon ? 'hide' : ''}`}
			data-placement={placement}
			data-content={content}
			data-original-title=''
			title=''
		/>
	)
}

export default Popover;