class LifeLineAI {
    constructor() {
        this.socket = io();
        this.ambulances = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialData();
        this.startRealTimeUpdates();
    }

    bindEvents() {
        document.getElementById('emergency-btn').onclick = () => this.triggerEmergency();
        
        // Socket listeners
        this.socket.on('connect', () => {
            console.log('✅ Connected to server');
            this.addNotification('🟢 Connected to LifeLine AI Server');
        });

        this.socket.on('initData', (data) => {
            this.ambulances = data.ambulances;
            this.updateAmbulanceList();
            this.updateTrafficSignals(data.trafficSignals);
        });

        this.socket.on('ambulanceUpdate', (ambulance) => {
            const index = this.ambulances.findIndex(a => a.id === ambulance.id);
            if (index > -1) {
                this.ambulances[index] = ambulance;
            } else {
                this.ambulances.push(ambulance);
            }
            this.updateAmbulanceList();
            document.getElementById('live-coords').textContent = 
                `${ambulance.lat.toFixed(4)}, ${ambulance.lng.toFixed(4)}`;
        });

        this.socket.on('newEmergency', (ambulance) => {
            this.ambulances.push(ambulance);
            this.updateAmbulanceList();
            this.addNotification(`🚨 NEW: ${ambulance.id} dispatched! ETA: ${ambulance.eta}`);
        });
    }

    async triggerEmergency() {
        const btn = document.getElementById('emergency-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Dispatching...';

        try {
            const response = await fetch('/api/emergency', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                btn.innerHTML = '✅ Emergency Dispatched!';
                setTimeout(() => {
                    btn.innerHTML = '🚨 New Emergency';
                    btn.disabled = false;
                }, 2000);
            }
        } catch (error) {
            console.error('Error:', error);
            this.addNotification('❌ Dispatch failed. Retrying...');
            btn.disabled = false;
            btn.innerHTML = '🚨 New Emergency';
        }
    }

    updateAmbulanceList() {
        const container = document.getElementById('ambulance-list');
        if (this.ambulances.length === 0) {
            container.innerHTML = '<div>No active ambulances</div>';
            return;
        }

        container.innerHTML = this.ambulances.map(amb => `
            <div class="ambulance-item">
                <div>
                    <div class="status-badge enroute">${amb.status}</div>
                    <strong>${amb.id}</strong>
                    <br><small>🏥 ${amb.destination}</small>
                </div>
                <div class="amb-info">
                    <div>⏱️ ${amb.eta}</div>
                    <div>🛣️ ${amb.route}</div>
                </div>
            </div>
        `).join('');
    }

    updateTrafficSignals(signals) {
        const container = document.getElementById('traffic-list');
        container.innerHTML = signals.map(signal => `
            <div class="traffic-item traffic-${signal.status}">
                <i class="fas fa-traffic-light"></i>
                <span>${signal.location}</span>
                <span class="signal-dot ${signal.status}"></span>
            </div>
        `).join('');
    }

    addNotification(message) {
        const container = document.getElementById('notifications');
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        container.appendChild(notif);
        
        setTimeout(() => notif.remove(), 5000);
    }

    loadInitialData() {
        fetch('/api/ambulances')
            .then(res => res.json())
            .then(data => {
                this.ambulances = data;
                this.updateAmbulanceList();
            });
    }

    startRealTimeUpdates() {
        // Update ETA every 10 seconds
        setInterval(() => {
            const etaEl = document.getElementById('predicted-eta');
            const currentEta = parseInt(etaEl.textContent);
            if (currentEta > 1) {
                etaEl.textContent = (currentEta - 1) + ' min';
            }
        }, 10000);
    }
}

// Start when page loads
document.addEventListener('DOMContentLoaded', () => {
    new LifeLineAI();
});