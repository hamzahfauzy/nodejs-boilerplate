export default {
    title: 'Dashboard',
    path: 'dashboard',
    permission: "dashboard.view",
    isDefault: true,
    content: {
        type: "html",
        dataSource: '/app/dashboard',
        initData: {
            total_omzet: 0,
            total_visitor: 0,
            total_request: 0,
            total_income: 0
        },
        value: `<h2>Dashboard</h2>
                <div class="row g-3 mb-4">
                    <div class="col-6 col-lg-3">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="bi bi-currency-dollar"></i></div>
                            <div class="stat-label small text-muted">Total Omzet</div>
                            <div class="stat-value h5 fw-bold mb-0">{{total_omzet}}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-3">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="bi bi-eye"></i></div>
                            <div class="stat-label small text-muted">Kunjungan</div>
                            <div class="stat-value h5 fw-bold mb-0">{{total_visitor}}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-3">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="bi bi-cart"></i></div>
                            <div class="stat-label small text-muted">Pesanan</div>
                            <div class="stat-value h5 fw-bold mb-0">{{total_request}}</div>
                        </div>
                    </div>
                    <div class="col-6 col-lg-3">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="bi bi-graph-up"></i></div>
                            <div class="stat-label small text-muted">Pertumbuhan</div>
                            <div class="stat-value h5 fw-bold mb-0">{{total_income}}</div>
                        </div>
                    </div>
                </div>`
    }
}