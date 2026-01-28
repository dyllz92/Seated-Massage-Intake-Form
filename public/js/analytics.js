/**
 * Analytics Dashboard - Client-side logic
 */

class AnalyticsDashboard {
    constructor() {
        this.sessionId = localStorage.getItem('analyticsSession');
        this.charts = {};
        this.init();
    }

    async init() {
        this.setupEventListeners();

        if (this.sessionId) {
            this.showDashboard();
            await this.loadDashboard();
        } else {
            this.showLogin();
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Dashboard actions
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.loadDashboard();
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Filters
        document.getElementById('periodFilter')?.addEventListener('change', () => {
            this.loadDashboard();
        });

        document.getElementById('formTypeFilter')?.addEventListener('change', () => {
            this.loadDashboard();
        });
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboardScreen').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'flex';
    }

    showLoading(show = true) {
        document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
    }

    async handleLogin() {
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'none';

        try {
            this.showLoading(true);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            this.showLoading(false);

            if (response.ok) {
                const data = await response.json();
                this.sessionId = data.sessionId;
                localStorage.setItem('analyticsSession', this.sessionId);
                document.getElementById('loginForm').reset();
                this.showDashboard();
                await this.loadDashboard();
            } else {
                errorDiv.textContent = 'Invalid password. Please try again.';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            this.showLoading(false);
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.style.display = 'block';
            console.error('Login error:', error);
        }
    }

    async handleLogout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'X-Session-Id': this.sessionId
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        localStorage.removeItem('analyticsSession');
        this.sessionId = null;
        this.clearCharts();
        this.showLogin();
    }

    async loadDashboard() {
        try {
            this.showLoading(true);

            const period = document.getElementById('periodFilter').value;
            const formType = document.getElementById('formTypeFilter').value;

            // Fetch all analytics data in parallel
            const [summary, trends, health, therapists, pressure, feelings] = await Promise.all([
                this.fetchAPI(`/api/analytics/summary`),
                this.fetchAPI(`/api/analytics/trends?period=${period}`),
                this.fetchAPI(`/api/analytics/health-issues`),
                this.fetchAPI(`/api/analytics/therapists`),
                this.fetchAPI(`/api/analytics/pressure`),
                this.fetchAPI(`/api/analytics/feeling-scores`)
            ]);

            this.renderSummaryCards(summary);
            this.renderTrendsChart(trends);
            this.renderHealthChart(health);
            this.renderTherapistsChart(therapists);
            this.renderPressureChart(pressure);
            this.renderFeelingsChart(feelings);

            this.showLoading(false);
        } catch (error) {
            this.showLoading(false);

            if (error.status === 401) {
                this.handleLogout();
                return;
            }

            console.error('Error loading dashboard:', error);
            alert('Failed to load dashboard data. Please refresh the page.');
        }
    }

    async fetchAPI(endpoint) {
        const response = await fetch(endpoint, {
            headers: {
                'X-Session-Id': this.sessionId
            }
        });

        if (!response.ok) {
            const error = new Error('API request failed');
            error.status = response.status;
            throw error;
        }

        return response.json();
    }

    renderSummaryCards(data) {
        document.getElementById('totalSubmissions').textContent = data.totalSubmissions;
        document.getElementById('submissionDetail').textContent =
            `${data.totalIntakes} intakes, ${data.totalFeedback} feedback`;

        document.getElementById('avgImprovement').textContent =
            data.avgImprovement > 0 ? `+${data.avgImprovement}` : data.avgImprovement;

        document.getElementById('recommendationRate').textContent =
            data.recommendationRate !== 0 ? `${data.recommendationRate}%` : 'N/A';

        document.getElementById('topTherapist').textContent = data.topTherapist;
        document.getElementById('topTherapistDetail').textContent =
            `${data.topTherapistSessions} sessions`;
    }

    renderTrendsChart(data) {
        const ctx = document.getElementById('trendsChart').getContext('2d');

        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Total',
                        data: data.values,
                        borderColor: '#9D4EDD',
                        backgroundColor: 'rgba(157, 78, 221, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#9D4EDD',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    renderHealthChart(data) {
        const ctx = document.getElementById('healthIssuesChart').getContext('2d');

        if (this.charts.health) {
            this.charts.health.destroy();
        }

        this.charts.health = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Frequency',
                        data: data.data,
                        backgroundColor: [
                            '#9D4EDD',
                            '#AD63ED',
                            '#7B2CBF',
                            '#B878E8',
                            '#6B1BA1',
                            '#BD73F5',
                            '#5D0F93',
                            '#C27FF9',
                            '#4B0A7B',
                            '#D28FFF'
                        ],
                        borderRadius: 8
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    renderPressureChart(data) {
        const ctx = document.getElementById('pressureChart').getContext('2d');

        if (this.charts.pressure) {
            this.charts.pressure.destroy();
        }

        const colors = data.backgroundColor || ['#9D4EDD', '#7B2CBF', '#AD63ED'];

        this.charts.pressure = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        data: data.data,
                        backgroundColor: colors,
                        borderColor: 'rgba(0, 0, 0, 0.3)',
                        borderWidth: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 16,
                            font: { size: 13, weight: 500 },
                            color: '#FFFFFF'
                        }
                    }
                }
            }
        });
    }

    renderTherapistsChart(data) {
        const ctx = document.getElementById('therapistsChart').getContext('2d');

        if (this.charts.therapists) {
            this.charts.therapists.destroy();
        }

        this.charts.therapists = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Sessions',
                        data: data.datasets[0].data,
                        backgroundColor: '#9D4EDD',
                        borderRadius: 8
                    },
                    {
                        label: 'Avg Pre-Feeling',
                        data: data.datasets[1].data,
                        backgroundColor: '#AD63ED',
                        borderRadius: 8
                    },
                    {
                        label: 'Avg Post-Feeling',
                        data: data.datasets[2].data,
                        backgroundColor: '#7B2CBF',
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 16,
                            font: { size: 13, weight: 500 },
                            color: '#FFFFFF'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    renderFeelingsChart(data) {
        const ctx = document.getElementById('feelingScoresChart').getContext('2d');

        if (this.charts.feelings) {
            this.charts.feelings.destroy();
        }

        const summary = data.summary;
        const improvement = summary.avgImprovement;

        this.charts.feelings = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Pre-Session', 'Post-Session'],
                datasets: [
                    {
                        label: 'Average Feeling Score',
                        data: [summary.avgPre, summary.avgPost],
                        backgroundColor: ['#9D4EDD', '#7B2CBF'],
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 16,
                            font: { size: 13, weight: 500 },
                            color: '#FFFFFF'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => {
                                if (context.dataIndex === 1) {
                                    return `Improvement: +${improvement}`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 10,
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    clearCharts() {
        for (const key in this.charts) {
            if (this.charts[key]) {
                this.charts[key].destroy();
            }
        }
        this.charts = {};
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsDashboard();
});
