(function () {
	'use strict';

	const input = document.getElementById('ffwtb_xml_file');
	const fileName = document.getElementById('ffwtb-file-name');
	const statusFile = document.getElementById('ffwtb-status-file');
	const statusValidation = document.getElementById('ffwtb-status-validation');
	const btn = document.getElementById('ffwtb-convert-btn');
	const form = document.getElementById('ffwtb-conversion-form');
	const progressPanel = document.getElementById('ffwtb-progress-panel');
	const progressTitle = document.getElementById('ffwtb-progress-title');
	const progressPercent = document.getElementById('ffwtb-progress-percent');
	const progressBar = document.getElementById('ffwtb-progress-bar');
	const progressSteps = Array.prototype.slice.call(document.querySelectorAll('[data-progress-step]'));
	const ajaxMessage = document.getElementById('ffwtb-ajax-message');
	const resultCard = document.getElementById('ffwtb-result-card');
	const resultSummary = document.getElementById('ffwtb-result-summary');
	const resultActions = document.getElementById('ffwtb-result-actions');
	const resultStats = document.getElementById('ffwtb-result-stats');
	const strings = window.ffwtbAdmin || {};
	const defaultButtonText = btn ? btn.textContent.trim() : '';
	function getString(key) {
		return Object.prototype.hasOwnProperty.call(strings, key) ? strings[key] : '';
	}
	function formatResultSummary(converted, skipped) {
		return getString('resultSummary')
			.replace('%1$d', converted)
			.replace('%2$d', skipped);
	}
	let progressTimers = [];
	let progressStartedAt = 0;
	const visualSuccessMinimumMs = 4800;

	function setButtonReady(hasFile) {
		if (!btn) {
			return;
		}

		btn.disabled = !hasFile;
		btn.textContent = hasFile ? (getString('readyToConvert') || defaultButtonText) : defaultButtonText;
		btn.removeAttribute('aria-busy');
	}

	function setProgress(percent, title) {
		const safePercent = Math.max(0, Math.min(100, percent));
		if (progressBar) {
			progressBar.style.width = safePercent + '%';
		}
		if (progressPercent) {
			progressPercent.textContent = safePercent + '%';
		}
		if (progressTitle && title) {
			progressTitle.textContent = title;
		}
	}

	function setStepState(activeStep) {
		let activeFound = false;
		progressSteps.forEach(function (item) {
			const step = item.getAttribute('data-progress-step');
			item.classList.remove('is-active', 'is-done', 'is-error');

			if (step === activeStep) {
				item.classList.add('is-active');
				activeFound = true;
			} else if (!activeFound) {
				item.classList.add('is-done');
			}
		});
	}

	function completeSteps() {
		progressSteps.forEach(function (item) {
			item.classList.remove('is-active', 'is-error');
			item.classList.add('is-done');
		});
	}

	function failStep(activeStep) {
		progressSteps.forEach(function (item) {
			item.classList.remove('is-active');
			if (item.getAttribute('data-progress-step') === activeStep) {
				item.classList.add('is-error');
			}
		});
	}

	function clearProgressTimers() {
		progressTimers.forEach(function (timer) {
			window.clearTimeout(timer);
		});
		progressTimers = [];
	}

	function showMessage(type, message) {
		if (!ajaxMessage) {
			return;
		}

		ajaxMessage.hidden = false;
		ajaxMessage.className = 'ffwtb-ajax-message is-' + type;
		ajaxMessage.textContent = message;
	}

	function hideMessage() {
		if (!ajaxMessage) {
			return;
		}

		ajaxMessage.hidden = true;
		ajaxMessage.textContent = '';
		ajaxMessage.className = 'ffwtb-ajax-message';
	}

	function startProgress() {
		clearProgressTimers();
		hideMessage();
		progressStartedAt = Date.now();

		if (resultCard) {
			resultCard.hidden = true;
		}

		if (progressPanel) {
			progressPanel.classList.remove('is-complete', 'is-error');
			progressPanel.classList.add('is-running');
		}

		setProgress(7, getString('progressUploading'));
		setStepState('upload');

		progressTimers.push(window.setTimeout(function () {
			setProgress(22, getString('progressValidating'));
			setStepState('validate');
			if (statusValidation) {
				statusValidation.textContent = getString('statusChecking');
			}
		}, 700));

		progressTimers.push(window.setTimeout(function () {
			setProgress(42, getString('progressParsing'));
			setStepState('parse');
			if (statusValidation) {
				statusValidation.textContent = getString('statusPassed');
			}
		}, 1600));

		progressTimers.push(window.setTimeout(function () {
			setProgress(63, getString('progressConverting'));
			setStepState('convert');
		}, 2700));

		progressTimers.push(window.setTimeout(function () {
			setProgress(82, getString('progressPreparing'));
			setStepState('prepare');
		}, 3800));

		progressTimers.push(window.setTimeout(function () {
			setProgress(94, getString('progressFinalising'));
		}, 4500));
	}

	function renderStats(stats) {
		if (!resultStats) {
			return;
		}

		const total = stats && stats.total_items ? stats.total_items : 0;
		const converted = stats && stats.converted_posts ? stats.converted_posts : 0;
		const skipped = stats && stats.skipped_items ? stats.skipped_items : 0;
		const images = stats && stats.image_references ? stats.image_references : 0;

		resultStats.innerHTML = '';
		[
			[getString('totalItemsLabel'), total],
			[getString('convertedPostsLabel'), converted],
			[getString('skippedItemsLabel'), skipped],
			[getString('imageReferencesLabel'), images]
		].forEach(function (row) {
			const item = document.createElement('div');
			const label = document.createElement('span');
			const value = document.createElement('strong');
			label.textContent = row[0];
			value.textContent = row[1];
			item.appendChild(label);
			item.appendChild(value);
			resultStats.appendChild(item);
		});
	}


	function normalizeDownloadUrl(url) {
		if (!url) {
			return '';
		}

		return String(url).replace(/&amp;/g, '&');
	}

	function renderActions(data) {
		if (!resultActions) {
			return;
		}

		resultActions.innerHTML = '';

		if (data.downloadUrl) {
			const xmlLink = document.createElement('a');
			xmlLink.className = 'button button-primary';
			xmlLink.href = normalizeDownloadUrl(data.downloadUrl);
			xmlLink.textContent = getString('downloadXml');
			resultActions.appendChild(xmlLink);
		}

		if (data.reportUrl) {
			const reportLink = document.createElement('a');
			reportLink.className = 'button ffwtb-outline';
			reportLink.href = normalizeDownloadUrl(data.reportUrl);
			reportLink.textContent = getString('downloadReport');
			resultActions.appendChild(reportLink);
		}
	}

	function completeProgressNow(data) {
		clearProgressTimers();
		setProgress(100, getString('conversionComplete'));
		completeSteps();

		if (progressPanel) {
			progressPanel.classList.remove('is-running');
			progressPanel.classList.add('is-complete');
		}

		if (statusValidation) {
			statusValidation.textContent = getString('statusPassed');
		}

		if (resultSummary && data.stats) {
			const converted = data.stats.converted_posts || 0;
			const skipped = data.stats.skipped_items || 0;
			resultSummary.textContent = formatResultSummary(converted, skipped);
		}

		renderActions(data);
		renderStats(data.stats || {});

		if (resultCard) {
			resultCard.hidden = false;
		}

		showMessage('success', data.notice || getString('conversionComplete'));
		setButtonReady(!!(input && input.files && input.files.length));
	}

	function finishProgress(data) {
		const elapsed = progressStartedAt ? Date.now() - progressStartedAt : visualSuccessMinimumMs;
		const remaining = Math.max(0, visualSuccessMinimumMs - elapsed);

		if (remaining > 0) {
			progressTimers.push(window.setTimeout(function () {
				completeProgressNow(data);
			}, remaining));
			return;
		}

		completeProgressNow(data);
	}

	function handleError(message) {
		clearProgressTimers();
		setProgress(100, getString('conversionFailed'));
		failStep('validate');

		if (progressPanel) {
			progressPanel.classList.remove('is-running');
			progressPanel.classList.add('is-error');
		}

		if (statusValidation) {
			statusValidation.textContent = getString('statusFailed');
		}

		showMessage('error', message || getString('conversionFailed'));
		setButtonReady(!!(input && input.files && input.files.length));
	}

	if (btn && input) {
		setButtonReady(!!(input.files && input.files.length));
	}

	if (input && fileName && statusFile) {
		input.addEventListener('change', function () {
			const hasFile = input.files && input.files.length;
			const selected = hasFile ? input.files[0].name : getString('noFileSelected');

			fileName.textContent = selected;
			statusFile.textContent = selected;

			if (statusValidation) {
				statusValidation.textContent = hasFile ? getString('statusReady') : getString('statusAutomatic');
			}

			setButtonReady(hasFile);
			setProgress(0, hasFile ? getString('readyToStart') : getString('waitingForFile'));
			progressSteps.forEach(function (item) {
				item.classList.remove('is-active', 'is-done', 'is-error');
			});
			hideMessage();
		});
	}

	if (btn && form) {
		form.addEventListener('submit', function (event) {
			if (!input || !(input.files && input.files.length)) {
				return;
			}

			if (!strings.ajaxUrl || !window.fetch || !window.FormData) {
				form.classList.add('is-converting');
				btn.textContent = getString('converting');
				btn.setAttribute('aria-busy', 'true');
				return;
			}

			event.preventDefault();

			const formData = new FormData(form);
			formData.set('action', 'ffwtb_convert_ajax');

			form.classList.add('is-converting');
			btn.disabled = true;
			btn.textContent = getString('converting');
			btn.setAttribute('aria-busy', 'true');
			startProgress();

			fetch(strings.ajaxUrl, {
				method: 'POST',
				body: formData,
				credentials: 'same-origin'
			})
				.then(function (response) {
					return response.json().catch(function () {
						throw new Error(getString('unexpectedResponse'));
					});
				})
				.then(function (response) {
					form.classList.remove('is-converting');

					if (!response || !response.success) {
						throw new Error(response && response.data && response.data.message ? response.data.message : getString('conversionFailed'));
					}

					finishProgress(response.data || {});
				})
				.catch(function (error) {
					form.classList.remove('is-converting');
					handleError(error && error.message ? error.message : getString('conversionFailed'));
				});
		});
	}
}());
