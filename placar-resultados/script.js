// Configuração dos valores dos objetivos
const config = {
    obj1: { value: 10, name: "Coleta de Latas" },
    obj2: { value: 25, name: "Entrega na Zona" },
    obj3: { value: 50, name: "Desafio Especial" },
    penalty: { value: -15, name: "Penalidades" }
};

// Estado do aplicativo
let state = {
    matchNumber: '',
    teamName: '',
    obj1: 0,
    obj2: 0,
    obj3: 0,
    penalty: 0
};

// Configuração da planilha
let sheetConfig = {
    url: ''
};

// Elementos DOM
const elements = {
    matchNumber: document.getElementById('matchNumber'),
    teamName: document.getElementById('teamName'),
    obj1Count: document.getElementById('obj1Count'),
    obj2Count: document.getElementById('obj2Count'),
    obj3Count: document.getElementById('obj3Count'),
    penaltyCount: document.getElementById('penaltyCount'),
    totalPoints: document.getElementById('totalPoints'),
    resetBtn: document.getElementById('resetBtn'),
    copyBtn: document.getElementById('copyBtn'),
    sheetBtn: document.getElementById('sheetBtn'),
    configBtn: document.getElementById('configBtn'),
    sheetConfig: document.getElementById('sheetConfig'),
    sheetUrl: document.getElementById('sheetUrl'),
    saveSheetBtn: document.getElementById('saveSheetBtn'),
    closeSheetBtn: document.getElementById('closeSheetBtn')
};

// Função para calcular o total de pontos
function calculateTotal() {
    const total = (state.obj1 * config.obj1.value) + 
                 (state.obj2 * config.obj2.value) + 
                 (state.obj3 * config.obj3.value) + 
                 (state.penalty * config.penalty.value);
    return Math.max(0, total);
}

// Função para atualizar toda a interface
function updateUI() {
    // Atualizar displays dos contadores
    elements.obj1Count.textContent = state.obj1;
    elements.obj2Count.textContent = state.obj2;
    elements.obj3Count.textContent = state.obj3;
    elements.penaltyCount.textContent = state.penalty;
    
    // Atualizar campos de texto
    elements.matchNumber.value = state.matchNumber;
    elements.teamName.value = state.teamName;
    
    // Atualizar total
    const total = calculateTotal();
    elements.totalPoints.textContent = total;
    
    // Salvar no localStorage
    saveToLocalStorage();
}

// Função para incrementar um contador
function increment(counter) {
    if (counter === 'penalty') {
        state.penalty++;
    } else {
        state[counter]++;
    }
    updateUI();
}

// Função para decrementar um contador (não deixa ficar negativo)
function decrement(counter) {
    if (counter === 'penalty') {
        if (state.penalty > 0) state.penalty--;
    } else {
        if (state[counter] > 0) state[counter]--;
    }
    updateUI();
}

// Função para resetar todos os valores
function resetAll() {
    if (confirm('⚠️ Tem certeza que deseja zerar todos os contadores?\nEsta ação não pode ser desfeita!')) {
        state = {
            matchNumber: state.matchNumber,
            teamName: state.teamName,
            obj1: 0,
            obj2: 0,
            obj3: 0,
            penalty: 0
        };
        updateUI();
        showToast('🔄 Todos os contadores foram zerados!', '#ff6b6b');
    }
}

// Função para gerar texto formatado do resultado
function getFormattedResult() {
    const matchNum = state.matchNumber.trim() || 'Sem partida';
    const team = state.teamName.trim() || 'Sem time';
    const total = calculateTotal();
    
    return `🏆 COMPETIÇÃO DE ROBÓTICA 🏆\n` +
           `📌 Partida: ${matchNum}\n` +
           `🤖 Time: ${team}\n` +
           `━━━━━━━━━━━━━━━━━━━━━━\n` +
           `📊 DETALHAMENTO DA PONTUAÇÃO:\n` +
           `• ${config.obj1.name}: ${state.obj1} x ${config.obj1.value} pts = ${state.obj1 * config.obj1.value} pts\n` +
           `• ${config.obj2.name}: ${state.obj2} x ${config.obj2.value} pts = ${state.obj2 * config.obj2.value} pts\n` +
           `• ${config.obj3.name}: ${state.obj3} x ${config.obj3.value} pts = ${state.obj3 * config.obj3.value} pts\n` +
           `• ${config.penalty.name}: ${state.penalty} x ${Math.abs(config.penalty.value)} pts = ${state.penalty * config.penalty.value} pts\n` +
           `━━━━━━━━━━━━━━━━━━━━━━\n` +
           `✨ PONTUAÇÃO TOTAL: ${total} PONTOS ✨\n` +
           `━━━━━━━━━━━━━━━━━━━━━━\n` +
           `📅 ${new Date().toLocaleString('pt-BR')}`;
}

// Função para copiar resultado
function copyResult() {
    const copyText = getFormattedResult();
    
    navigator.clipboard.writeText(copyText).then(() => {
        showToast('✅ Resultado copiado com sucesso!', '#00b09b');
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
        fallbackCopy(copyText);
    });
}

// Fallback para cópia em dispositivos mais antigos
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('✅ Resultado copiado com sucesso!', '#00b09b');
    } catch (err) {
        showToast('❌ Erro ao copiar. Tente novamente.', '#ff6b6b');
    }
    document.body.removeChild(textarea);
}

// Função para salvar na planilha
async function saveToSheet() {
    if (!sheetConfig.url) {
        showToast('⚠️ Configure a URL da planilha primeiro!', '#ff6b6b');
        showSheetConfig();
        return;
    }
    
    const matchNum = state.matchNumber.trim() || 'Sem partida';
    const team = state.teamName.trim() || 'Sem time';
    const total = calculateTotal();
    
    const data = {
        timestamp: new Date().toISOString(),
        matchNumber: matchNum,
        teamName: team,
        obj1_count: state.obj1,
        obj1_points: state.obj1 * config.obj1.value,
        obj2_count: state.obj2,
        obj2_points: state.obj2 * config.obj2.value,
        obj3_count: state.obj3,
        obj3_points: state.obj3 * config.obj3.value,
        penalty_count: state.penalty,
        penalty_points: state.penalty * config.penalty.value,
        total_points: total
    };
    
    showToast('💾 Salvando na planilha...', '#00d4ff');
    
    try {
        // Tentar enviar para o Google Sheets
        const response = await fetch(sheetConfig.url, {
            method: 'POST',
            mode: 'no-cors', // Necessário para Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Como no-cors não permite ler a resposta, assumimos sucesso
        showToast('✅ Dados salvos na planilha com sucesso!', '#00b09b');
        
        // Opcional: salvar também localmente como backup
        saveToLocalBackup(data);
        
    } catch (error) {
        console.error('Erro ao salvar na planilha:', error);
        showToast('❌ Erro ao salvar. Verifique a URL e tente novamente.', '#ff6b6b');
        
        // Salvar localmente como fallback
        saveToLocalBackup(data);
        showToast('💾 Dados salvos localmente como backup!', '#ffa500');
    }
}

// Salvar backup local dos dados
function saveToLocalBackup(data) {
    let backups = JSON.parse(localStorage.getItem('robocounter_backups') || '[]');
    backups.push(data);
    // Manter apenas os últimos 100 registros
    if (backups.length > 100) backups = backups.slice(-100);
    localStorage.setItem('robocounter_backups', JSON.stringify(backups));
}

// Exportar backups para CSV
function exportBackupsToCSV() {
    const backups = JSON.parse(localStorage.getItem('robocounter_backups') || '[]');
    if (backups.length === 0) {
        showToast('📭 Nenhum backup encontrado!', '#ffa500');
        return;
    }
    
    const headers = ['Timestamp', 'Partida', 'Time', 'Obj1 Count', 'Obj1 Points', 'Obj2 Count', 'Obj2 Points', 'Obj3 Count', 'Obj3 Points', 'Penalty Count', 'Penalty Points', 'Total Points'];
    const csvRows = [headers];
    
    backups.forEach(backup => {
        const row = [
            backup.timestamp,
            backup.matchNumber,
            backup.teamName,
            backup.obj1_count,
            backup.obj1_points,
            backup.obj2_count,
            backup.obj2_points,
            backup.obj3_count,
            backup.obj3_points,
            backup.penalty_count,
            backup.penalty_points,
            backup.total_points
        ];
        csvRows.push(row);
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `robocounter_backup_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('📥 Backup exportado com sucesso!', '#00b09b');
}

// Mostrar/esconder configuração da planilha
function showSheetConfig() {
    elements.sheetConfig.style.display = 'block';
    elements.sheetUrl.value = sheetConfig.url;
}

function hideSheetConfig() {
    elements.sheetConfig.style.display = 'none';
}

function saveSheetConfig() {
    const url = elements.sheetUrl.value.trim();
    if (url) {
        sheetConfig.url = url;
        saveSheetConfigToLocal();
        showToast('✅ Configuração da planilha salva!', '#00b09b');
        hideSheetConfig();
    } else {
        showToast('⚠️ Por favor, insira uma URL válida!', '#ff6b6b');
    }
}

// Função para mostrar notificação temporária
function showToast(message, color = '#00d4ff') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = color;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Salvar dados no localStorage
function saveToLocalStorage() {
    try {
        const dataToSave = {
            state: state,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('robocounter_data', JSON.stringify(dataToSave));
    } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
    }
}

// Salvar configuração da planilha no localStorage
function saveSheetConfigToLocal() {
    try {
        localStorage.setItem('robocounter_sheet_config', JSON.stringify(sheetConfig));
    } catch (e) {
        console.error('Erro ao salvar configuração da planilha:', e);
    }
}

// Carregar dados do localStorage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('robocounter_data');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.state) {
                state = parsed.state;
                updateUI();
                showToast('📀 Dados carregados automaticamente!', '#00d4ff');
            }
        }
        
        const savedSheetConfig = localStorage.getItem('robocounter_sheet_config');
        if (savedSheetConfig) {
            const parsed = JSON.parse(savedSheetConfig);
            sheetConfig = parsed;
        }
    } catch (e) {
        console.error('Erro ao carregar do localStorage:', e);
    }
}

// Event Listeners
function setupEventListeners() {
    // Botões de incremento e decremento
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            increment(target);
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => { btn.style.transform = ''; }, 100);
        });
    });
    
    document.querySelectorAll('.btn-sub').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            decrement(target);
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => { btn.style.transform = ''; }, 100);
        });
    });
    
    // Campos de texto
    elements.matchNumber.addEventListener('input', (e) => {
        state.matchNumber = e.target.value;
        saveToLocalStorage();
    });
    
    elements.teamName.addEventListener('input', (e) => {
        state.teamName = e.target.value;
        saveToLocalStorage();
    });
    
    // Botões de controle
    elements.resetBtn.addEventListener('click', resetAll);
    elements.copyBtn.addEventListener('click', copyResult);
    elements.sheetBtn.addEventListener('click', saveToSheet);
    elements.configBtn.addEventListener('click', showSheetConfig);
    elements.saveSheetBtn.addEventListener('click', saveSheetConfig);
    elements.closeSheetBtn.addEventListener('click', hideSheetConfig);
    
    // Botão secreto: clique duplo no título para exportar backups
    let clickCount = 0;
    let timer;
    document.querySelector('h1').addEventListener('click', () => {
        clickCount++;
        if (clickCount === 3) {
            exportBackupsToCSV();
            clickCount = 0;
            clearTimeout(timer);
        } else {
            clearTimeout(timer);
            timer = setTimeout(() => { clickCount = 0; }, 500);
        }
    });
}

// Inicializar aplicação
function init() {
    loadFromLocalStorage();
    setupEventListeners();
    console.log('🚀 RoboCounter inicializado com sucesso!');
    console.log('💡 Dica: Clique 3 vezes no título para exportar backups');
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}