// Feedback Form - Submission and Validation
(function() {
    'use strict';

    // Simple Signature Pad for feedback form
    class FeedbackSignaturePad {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.isDrawing = false;
            this.hasSignature = false;

            this.resizeCanvas();
            this.setupCanvas();
            this.bindEvents();
        }

        resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const fallbackWidth = (this.canvas.parentElement && this.canvas.parentElement.clientWidth) || 400;
            const cssWidth = this.canvas.offsetWidth || fallbackWidth;
            const cssHeight = this.canvas.offsetHeight || 150;
            this.canvas.width = cssWidth * ratio;
            this.canvas.height = cssHeight * ratio;
            this.canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        setupCanvas() {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
        }

        bindEvents() {
            // Mouse events
            this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
            this.canvas.addEventListener('mousemove', (e) => this.draw(e));
            this.canvas.addEventListener('mouseup', () => this.stopDrawing());
            this.canvas.addEventListener('mouseout', () => this.stopDrawing());

            // Touch events
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startDrawing(e.touches[0]);
            });
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                this.draw(e.touches[0]);
            });
            this.canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopDrawing();
            });
        }

        getCoordinates(event) {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }

        startDrawing(event) {
            this.isDrawing = true;
            const coords = this.getCoordinates(event);
            this.ctx.beginPath();
            this.ctx.moveTo(coords.x, coords.y);
        }

        draw(event) {
            if (!this.isDrawing) return;
            const coords = this.getCoordinates(event);
            this.ctx.lineTo(coords.x, coords.y);
            this.ctx.stroke();
            this.hasSignature = true;
        }

        stopDrawing() {
            if (this.isDrawing) {
                this.isDrawing = false;
                this.ctx.closePath();

                // Update hidden fields
                if (this.hasDrawnContent()) {
                    const sigField = document.getElementById('signatureData');
                    const signedAtField = document.getElementById('signedAt');
                    if (sigField) sigField.value = this.toDataURL();
                    if (signedAtField) signedAtField.value = new Date().toISOString();
                }
            }
        }

        clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.hasSignature = false;
            const sigField = document.getElementById('signatureData');
            const signedAtField = document.getElementById('signedAt');
            if (sigField) sigField.value = '';
            if (signedAtField) signedAtField.value = '';
        }

        toDataURL() {
            return this.canvas.toDataURL('image/png');
        }

        hasDrawnContent() {
            if (!this.hasSignature) return false;
            try {
                const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                const data = imageData.data;
                for (let i = 3; i < data.length; i += 4) {
                    if (data[i] > 0) return true;
                }
            } catch (e) {
                return this.hasSignature;
            }
            return false;
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('feedbackForm');
        if (!form) return;

        // Initialize signature pad
        const canvas = document.getElementById('signatureCanvas');
        let signaturePad = null;
        if (canvas) {
            signaturePad = new FeedbackSignaturePad(canvas);

            // Clear button
            const clearBtn = document.getElementById('clearSignature');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => signaturePad.clear());
            }

            // Handle resize
            window.addEventListener('resize', () => {
                if (signaturePad && !signaturePad.hasDrawnContent()) {
                    signaturePad.resizeCanvas();
                    signaturePad.setupCanvas();
                }
            });
        }

        // Slider value display
        const feelingSlider = document.getElementById('feelingPost');
        const feelingValue = document.getElementById('feelingPostValue');
        if (feelingSlider && feelingValue) {
            feelingSlider.addEventListener('input', () => {
                feelingValue.textContent = feelingSlider.value;
            });
        }

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate required fields
            const fullName = document.getElementById('fullName');
            const therapistRadios = document.querySelectorAll('input[name="therapistName"]');
            const recommendRadios = document.querySelectorAll('input[name="wouldRecommend"]');

            if (!fullName || !fullName.value.trim()) {
                alert('Please enter your full name.');
                return;
            }

            if (!Array.from(therapistRadios).some(r => r.checked)) {
                alert('Please select your therapist.');
                return;
            }

            if (!Array.from(recommendRadios).some(r => r.checked)) {
                alert('Please indicate if you would recommend AO Wellness.');
                return;
            }

            // Collect form data
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Add metadata
            const nowIso = new Date().toISOString();
            data.submissionDate = nowIso;
            data.createdAt = nowIso;
            data.updatedAt = nowIso;
            data.formType = 'feedback';
            data.selectedBrand = 'hemisphere';

            // Show loading
            showLoading(true);

            try {
                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok) {
                    window.location.href = '/success';
                } else {
                    alert('Error submitting feedback: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('An error occurred while submitting. Please try again.');
            } finally {
                showLoading(false);
            }
        });
    });

    function showLoading(show) {
        let overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Submitting your feedback...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
})();
