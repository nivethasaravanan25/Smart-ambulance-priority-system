class LifeLineAI {
    constructor() {
        this.socket = io();
        this.ambulances = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialData();
    }

    bindEvents() {
        document.getElementById('emergency-btn').onclick = () => this.triggerEmergency();
    }

    async triggerEmergency() {

        const btn = document.getElementById('emergency-btn');
        btn.innerHTML = "🚑 Dispatching...";
        btn.disabled = true;

        await fetch('/api/emergency', { method: 'POST' });

        // send message to map
        const iframe = document.getElementById("mapFrame");

        console.log("📤 sending START");

        iframe.contentWindow.postMessage({ type: "START" }, "*");

        btn.innerHTML = "✅ Sent";

        setTimeout(() => {
            btn.innerHTML = "🚨 New Emergency";
            btn.disabled = false;
        }, 2000);
    }

    loadInitialData() {
        fetch('/api/ambulances')
            .then(res => res.json())
            .then(data => {
                this.ambulances = data;
                this.updateAmbulanceList();
            });
    }

    updateAmbulanceList() {
        const container = document.getElementById('ambulance-list');

        container.innerHTML = this.ambulances.map(amb => `
            <div class="ambulance-item">
                <div>
                    <div class="status-badge">${amb.status}</div>
                    <strong>${amb.id}</strong>
                    <br><small>${amb.destination}</small>
                </div>
                <div class="amb-info">
                    <div>${amb.eta}</div>
                    <div>${amb.route}</div>
                </div>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LifeLineAI();
});