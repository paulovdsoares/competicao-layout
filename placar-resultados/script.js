// Configuração dos valores dos objetivos
const config = {
    golfBall: { value: 10, name: "Bola Golfe" },
    silverBall: { value: 20, name: "Bola Prata" },
    redBall: { value: 30, name: "Bola Vermelha" },
    goal: { value: 50, name: "Gol" },
    silverTrap: { value: 20, name: "Caçapa Prata" },
    redTrap: { value: 30, name: "Caçapa Vermelha" },
    tunnel: { value: 25, name: "Túnel" },
    redCube: { value: 120, name: "Cubo Vermelho" },
    blueCube: { value: 140, name: "Cubo Azul" },
    whiteCube: { value: 180, name: "Cubo Branco Extra" }
};

// Estado do aplicativo
let state = {
    matchNumber: '',
    teamName: '',
    golfBall: 0,
    silverBall: 0,
    redBall: 0,
    goal: 0,
    silverTrap: 0,
    redTrap: 0,
    tunnel: 0,
    redCube: 0,
    blueCube: 0,
    whiteCube: 0
};

// Configuração da planilha
let sheetConfig = {
    url: ''
};

// Elementos DOM
const elements = {
    matchNumber: document.getElementById('matchNumber'),
    teamName: document.getElementById('teamName'),
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

// Elementos dos contadores
const counterElements = {
    golfBall: document.getElementById('golfBallCount'),
    silverBall: document.getElementById('silverBallCount'),
    redBall: document.getElementById('redBallCount'),
    goal: document.getElementById('goalCount'),
    silverTrap: document.getElementById('silverTrapCount'),
    redTrap: document.getElementById('redTrapCount'),
    tunnel: document.getElementById('tunnelCount'),
    redCube: document.getElementById('redCubeCount'),
    blueCube: document.getElementById('blueCubeCount'),
    whiteCube: document.getElementById('whiteCubeCount')
};

// Elementos do cronômetro
const timerDisplay = document.getElementById('timerDisplay');
const startTimerBtn = document.getElementById('startTimerBtn');
const pauseTimerBtn = document.getElementById('pauseTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');

let timeSeconds = 360; // 6 minutos = 360 segundos
let timerInterval = null;
let isRunning = false;

// Função para atualizar o display do cronômetro
function updateTimerDisplay() {
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = timeSeconds % 60;
    if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Quando chegar a zero, para automaticamente
    if (timeSeconds === 0 && isRunning) {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        showToast('⏰ Tempo esgotado! 6 minutos de partida concluídos.', '#ff6b6b');
    }
}

// Função para iniciar o cronômetro
function startTimer() {
    if (timerInterval) return; // já está rodando
    if (timeSeconds <= 0) {
        showToast('⏰ O tempo já acabou! Clique em Resetar para começar uma nova partida.', '#ffa500');
        return;
    }
    isRunning = true;
    timerInterval = setInterval(() => {
        if (isRunning && timeSeconds > 0) {
            timeSeconds--;
            updateTimerDisplay();
        } else if (timeSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;
        }
    }, 1000);
    showToast('▶️ Cronômetro iniciado!', '#008b4a');
}

// Função para pausar o cronômetro
function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        showToast('⏸️ Cronômetro pausado.', '#ffc107');
    } else {
        showToast('⚠️ O cronômetro já está pausado.', '#ffa500');
    }
}

// Função para resetar o cronômetro
function resetTimer() {
    // Para o cronômetro se estiver rodando
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isRunning = false;
    timeSeconds = 360;
    updateTimerDisplay();
    showToast('🔄 Cronômetro resetado para 6 minutos!', '#00d4ff');
}

// Função para calcular o total de pontos
function calculateTotal() {
    let total = 0;
    for (const key in config) {
        total += state[key] * config[key].value;
    }
    return total;
}

// Função para atualizar toda a interface
function updateUI() {
    // Atualizar displays dos contadores
    for (const key in counterElements) {
        if (counterElements[key]) {
            counterElements[key].textContent = state[key];
        }
    }
    
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
    if (counter in state) {
        state[counter]++;
        updateUI();
    }
}

// Função para decrementar um contador (não deixa ficar negativo)
function decrement(counter) {
    if (counter in state && state[counter] > 0) {
        state[counter]--;
        updateUI();
    }
}

// Função para resetar todos os valores
function resetAll() {
    if (confirm('⚠️ Tem certeza que deseja zerar todos os contadores?\nEsta ação não pode ser desfeita!')) {
        for (const key in config) {
            state[key] = 0;
        }
        updateUI();
        showToast('🔄 Todos os contadores foram zerados!', '#ff6b6b');
    }
}

// Função para gerar texto formatado do resultado
function getFormattedResult() {
    const matchNum = state.matchNumber.trim() || 'Sem partida';
    const team = state.teamName.trim() || 'Sem time';
    const total = calculateTotal();
    
    // Tempo restante ou decorrido
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = timeSeconds % 60;
    const tempoRestante = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    let detalhamento = '';
    for (const key in config) {
        if (state[key] > 0) {
            detalhamento += `• ${config[key].name}: ${state[key]} x ${config[key].value} pts = ${state[key] * config[key].value} pts\n`;
        }
    }
    
    if (detalhamento === '') {
        detalhamento = '• Nenhuma pontuação registrada\n';
    }
    
    return `🏆 COMPETIÇÃO DE ROBÓTICA 🏆\n` +
           `📌 Partida: ${matchNum}\n` +
           `🤖 Time: ${team}\n` +
           `⏱️ Tempo restante: ${tempoRestante} / 6 min\n` +
           `━━━━━━━━━━━━━━━━━━━━━━\n` +
           `📊 DETALHAMENTO DA PONTUAÇÃO:\n${detalhamento}` +
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
    
    // ESTRUTURA DE DADOS COMPATÍVEL COM O Google Apps Script
    const data = {
        timestamp: new Date().toISOString(),
        matchNumber: matchNum,
        teamName: team,
        // Mantendo os campos antigos para compatibilidade (valores zerados)
        obj1_count: 0,
        obj1_points: 0,
        obj2_count: 0,
        obj2_points: 0,
        obj3_count: 0,
        obj3_points: 0,
        penalty_count: 0,
        penalty_points: 0,
        // NOVOS CAMPOS que você vai adicionar no Google Apps Script
        golfBall_count: state.golfBall,
        golfBall_points: state.golfBall * config.golfBall.value,
        silverBall_count: state.silverBall,
        silverBall_points: state.silverBall * config.silverBall.value,
        redBall_count: state.redBall,
        redBall_points: state.redBall * config.redBall.value,
        goal_count: state.goal,
        goal_points: state.goal * config.goal.value,
        silverTrap_count: state.silverTrap,
        silverTrap_points: state.silverTrap * config.silverTrap.value,
        redTrap_count: state.redTrap,
        redTrap_points: state.redTrap * config.redTrap.value,
        tunnel_count: state.tunnel,
        tunnel_points: state.tunnel * config.tunnel.value,
        redCube_count: state.redCube,
        redCube_points: state.redCube * config.redCube.value,
        blueCube_count: state.blueCube,
        blueCube_points: state.blueCube * config.blueCube.value,
        whiteCube_count: state.whiteCube,
        whiteCube_points: state.whiteCube * config.whiteCube.value,
        total_points: total
    };
    
    showToast('💾 Salvando na planilha...', '#00d4ff');
    
    try {
        await fetch(sheetConfig.url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        showToast('✅ Dados salvos na planilha com sucesso!', '#00b09b');
        saveToLocalBackup(data);
        
    } catch (error) {
        console.error('Erro ao salvar na planilha:', error);
        showToast('❌ Erro ao salvar. Verifique a URL e tente novamente.', '#ff6b6b');
        saveToLocalBackup(data);
        showToast('💾 Dados salvos localmente como backup!', '#ffa500');
    }
}


// Salvar backup local dos dados
function saveToLocalBackup(data) {
    let backups = JSON.parse(localStorage.getItem('robocounter_backups') || '[]');
    backups.push(data);
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
    
    const headers = ['Timestamp', 'Partida', 'Time', 'BolaGolfe', 'BolaPrata', 'BolaVermelha', 'Gol', 'CaçapaPrata', 'CaçapaVermelha', 'Túnel', 'CuboVermelho', 'CuboAzul', 'CuboBranco', 'Total'];
    const csvRows = [headers];
    
    backups.forEach(backup => {
        const row = [
            backup.timestamp,
            backup.matchNumber,
            backup.teamName,
            `${backup.golfBall_count}(${backup.golfBall_points})`,
            `${backup.silverBall_count}(${backup.silverBall_points})`,
            `${backup.redBall_count}(${backup.redBall_points})`,
            `${backup.goal_count}(${backup.goal_points})`,
            `${backup.silverTrap_count}(${backup.silverTrap_points})`,
            `${backup.redTrap_count}(${backup.redTrap_points})`,
            `${backup.tunnel_count}(${backup.tunnel_points})`,
            `${backup.redCube_count}(${backup.redCube_points})`,
            `${backup.blueCube_count}(${backup.blueCube_points})`,
            `${backup.whiteCube_count}(${backup.whiteCube_points})`,
            backup.total_points
        ];
        csvRows.push(row);
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `robocounter_backup_${new Date().toISOString().slice(0,19)}.csv`);
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
    
    // Botões do cronômetro
    if (startTimerBtn) startTimerBtn.addEventListener('click', startTimer);
    if (pauseTimerBtn) pauseTimerBtn.addEventListener('click', pauseTimer);
    if (resetTimerBtn) resetTimerBtn.addEventListener('click', resetTimer);
    
    // Botão secreto: clique 3 vezes no título para exportar backups
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
    updateTimerDisplay();
    console.log('🚀 RoboCounter inicializado com sucesso!');
    console.log('💡 Dica: Clique 3 vezes no título para exportar backups');
    console.log('⏱️ Cronômetro de 6 minutos com botões Iniciar/Pausar/Resetar!');
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}