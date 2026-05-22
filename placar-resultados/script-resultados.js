// Chave para armazenamento dos resultados
const STORAGE_KEY = 'robocounter_resultados';

// Estado atual
let allResults = [];
let updateInterval = null;

// Carregar resultados do localStorage
function loadResults() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            allResults = JSON.parse(stored);
        } else {
            allResults = [];
        }
        render();
    } catch (e) {
        console.error('Erro ao carregar resultados:', e);
        allResults = [];
    }
}

// Remover resultado
function removeResult(index) {
    if (confirm('Tem certeza que deseja remover este resultado?')) {
        allResults.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allResults));
        render();
        showToast('✅ Resultado removido com sucesso!');
    }
}

// Limpar todos os resultados
function clearAllResults() {
    if (confirm('⚠️ ATENÇÃO: Isso apagará TODOS os resultados da competição!\nTem certeza?')) {
        allResults = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allResults));
        render();
        showToast('📀 Todos os resultados foram apagados!');
    }
}

// Renderizar toda a interface
function render() {
    const searchTerm = document.getElementById('searchTeam')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortBy')?.value || 'points';
    
    let filtered = [...allResults];
    
    // Filtrar por busca
    if (searchTerm) {
        filtered = filtered.filter(r => 
            r.teamName.toLowerCase().includes(searchTerm) ||
            r.matchNumber.toLowerCase().includes(searchTerm)
        );
    }
    
    // Ordenar
    if (sortBy === 'points') {
        filtered.sort((a, b) => b.total_points - a.total_points);
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.teamName.localeCompare(b.teamName));
    } else if (sortBy === 'match') {
        filtered.sort((a, b) => a.matchNumber.localeCompare(b.matchNumber));
    }
    
    // Atualizar estatísticas
    updateStats();
    
    // Atualizar pódio
    updatePodium(filtered);
    
    // Atualizar tabela
    updateTable(filtered);
}

// Atualizar estatísticas
function updateStats() {
    const totalTeams = allResults.length;
    const highestScore = allResults.length > 0 ? Math.max(...allResults.map(r => r.total_points)) : 0;
    const averageScore = allResults.length > 0 ? 
        (allResults.reduce((sum, r) => sum + r.total_points, 0) / allResults.length).toFixed(1) : 0;
    const activeTeams = allResults.filter(r => r.total_points > 0).length;
    
    document.getElementById('totalTeams').textContent = totalTeams;
    document.getElementById('highestScore').textContent = highestScore;
    document.getElementById('averageScore').textContent = averageScore;
    document.getElementById('activeTeams').textContent = activeTeams;
}

// Atualizar pódio
function updatePodium(filtered) {
    const podiumContainer = document.getElementById('podiumContainer');
    const top3 = filtered.slice(0, 3);
    
    if (top3.length === 0) {
        podiumContainer.innerHTML = '<div class="stat-card">Aguardando resultados...</div>';
        return;
    }
    
    const podiumHTML = [];
    const order = [1, 0, 2];
    
    for (let i of order) {
        if (top3[i]) {
            const rank = i + 1;
            let rankClass = '';
            let medalIcon = '';
            
            if (rank === 1) {
                rankClass = 'primeiro';
                medalIcon = '🥇';
            } else if (rank === 2) {
                rankClass = 'segundo';
                medalIcon = '🥈';
            } else if (rank === 3) {
                rankClass = 'terceiro';
                medalIcon = '🥉';
            }
            
            podiumHTML.push(`
                <div class="podium-card ${rankClass}">
                    <div class="podium-position">${medalIcon} ${rank}º Lugar</div>
                    <div class="podium-team">${escapeHtml(top3[i].teamName)}</div>
                    <div class="podium-points">${top3[i].total_points} pts</div>
                    <div style="font-size: 0.8em; margin-top: 8px;">Partida: ${escapeHtml(top3[i].matchNumber)}</div>
                </div>
            `);
        }
    }
    
    podiumContainer.innerHTML = podiumHTML.join('');
}

// Atualizar tabela
function updateTable(filtered) {
    const tbody = document.getElementById('tableBody');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">📭 Nenhum resultado registrado ainda</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map((result, idx) => {
        let rankClass = '';
        let medal = '';
        if (idx === 0) {
            rankClass = 'rank-1';
            medal = '🥇 ';
        } else if (idx === 1) {
            rankClass = 'rank-2';
            medal = '🥈 ';
        } else if (idx === 2) {
            rankClass = 'rank-3';
            medal = '🥉 ';
        }
        
        return `
            <tr class="${rankClass}">
                <td>${medal}${idx + 1}</td>
                <td><strong>${escapeHtml(result.teamName)}</strong></td>
                <td>${escapeHtml(result.matchNumber)}</td>
                <td>${result.obj1_count} (${result.obj1_points} pts)</td>
                <td>${result.obj2_count} (${result.obj2_points} pts)</td>
                <td>${result.obj3_count} (${result.obj3_points} pts)</td>
                <td style="color: ${result.penalty_points < 0 ? '#dc3545' : '#28a745'}">${result.penalty_count} (${result.penalty_points} pts)</td>
                <td><strong style="font-size: 1.1em; color: #008b4a;">${result.total_points} pts</strong></td>
            </tr>
        `;
    }).join('');
}

// Função auxiliar para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mostrar toast
function showToast(message) {
    let toast = document.getElementById('toastMessage');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMessage';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #008b4a;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 2500);
}

// Exportar resultados para CSV
function exportToCSV() {
    if (allResults.length === 0) {
        showToast('📭 Nenhum resultado para exportar');
        return;
    }
    
    const headers = ['Posição', 'Time', 'Partida', 'Coleta (qtd)', 'Coleta (pts)', 'Entrega (qtd)', 'Entrega (pts)', 'Desafio (qtd)', 'Desafio (pts)', 'Penalidades (qtd)', 'Penalidades (pts)', 'Total'];
    const csvRows = [headers];
    
    allResults.forEach((result, idx) => {
        csvRows.push([
            idx + 1,
            result.teamName,
            result.matchNumber,
            result.obj1_count, result.obj1_points,
            result.obj2_count, result.obj2_points,
            result.obj3_count, result.obj3_points,
            result.penalty_count, result.penalty_points,
            result.total_points
        ]);
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `resultados_robotica_${new Date().toISOString().slice(0,19)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('📥 Resultados exportados com sucesso!');
}

// Escutar mudanças no localStorage (para atualização em tempo real entre abas)
function setupStorageListener() {
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            loadResults();
            showToast('🔄 Novos resultados detectados!');
        }
    });
}

// Configurar atualização automática
function setupAutoUpdate() {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => {
        loadResults();
    }, 5000);
}

// Event listeners
function setupEventListeners() {
    const searchTeam = document.getElementById('searchTeam');
    const sortBy = document.getElementById('sortBy');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (searchTeam) searchTeam.addEventListener('input', () => render());
    if (sortBy) sortBy.addEventListener('change', () => render());
    if (refreshBtn) refreshBtn.addEventListener('click', () => loadResults());
    if (exportBtn) exportBtn.addEventListener('click', () => exportToCSV());
    if (clearBtn) clearBtn.addEventListener('click', () => clearAllResults());
    
    // Tecla F5 para atualizar
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F5') {
            e.preventDefault();
            loadResults();
            showToast('🔄 Resultados atualizados!');
        }
    });
}

// Inicialização
function init() {
    loadResults();
    setupStorageListener();
    setupAutoUpdate();
    setupEventListeners();
    console.log('📊 Painel de Resultados IFBA inicializado!');
    console.log('💡 Dica: Use F5 para atualizar manualmente');
}

// Iniciar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}