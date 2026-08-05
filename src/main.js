import './style.css'

document.querySelector('#app').innerHTML = `
  <header>
    <h1>Torneio das Guildas</h1>
    <p class="subtitle">A glória aguarda os mais bravos. Reúna seus aliados, forje sua guilda e entre na batalha pelo domínio absoluto do reino.</p>
  </header>
  
  <section class="dashboard">
    <div class="card">
      <h2>⚔️ Inscrições</h2>
      <p>Registre sua guilda para o próximo torneio. As vagas são limitadas, então seja rápido e prepare seus melhores guerreiros para a arena.</p>
      <button class="btn" id="btn-registrar">Registrar Agora</button>
    </div>
    
    <div class="card">
      <h2>🏆 Classificação</h2>
      <p>Acompanhe o ranking em tempo real. Veja quem domina a tabela, explore o histórico de batalhas e descubra quais guildas estão no topo.</p>
      <button class="btn">Ver Ranking</button>
    </div>
    
    <div class="card">
      <h2>📜 Regras do Combate</h2>
      <p>Entenda o sistema de pontuação, as fases do torneio e as punições. O conhecimento tático é tão importante quanto a força bruta.</p>
      <button class="btn">Ler o Edital</button>
    </div>
  </section>
`

document.querySelector('#btn-registrar').addEventListener('click', () => {
  alert('O sistema de registro estará disponível em breve!');
})
