// Results page visualization and analysis

class ResultsVisualization {
  constructor() {
    this.initializeGraphs();
    this.initializeEventListeners();
    this.loadSimulationData();
  }

  initializeGraphs() {
    // Initialize D3.js resource allocation graph
    const width = 800;
    const height = 400;

    this.svg = d3.select('#allocation-graph')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Initialize Chart.js graphs
    this.initializeProcessChart();
    this.initializeResourceChart();
  }

  initializeProcessChart() {
    const ctx = document.getElementById('process-chart').getContext('2d');
    this.processChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['P1', 'P2', 'P3', 'P4'],
        datasets: [{
          label: 'Resource Usage',
          data: [2, 3, 1, 4],
          backgroundColor: 'rgba(0, 102, 204, 0.5)',
          borderColor: 'rgba(0, 102, 204, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  initializeResourceChart() {
    const ctx = document.getElementById('resource-chart').getContext('2d');
    this.resourceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  }

  initializeEventListeners() {
    document.getElementById('export-results').addEventListener('click', () => this.exportResults());
    document.getElementById('clear-history').addEventListener('click', () => this.clearHistory());
  }

  loadSimulationData() {
    const simulationResult = JSON.parse(sessionStorage.getItem('simulationResult'));
    if (!simulationResult) {
      console.error('No simulation data found');
      return;
    }

    this.updateStatus(simulationResult);
    this.updateResourceGraph(simulationResult.system_state);
    this.updateMetrics(simulationResult);
  }
  
  getSimulationData() {
    // In a real application, this would retrieve data from localStorage or an API
    // For now, we'll use sample data
    return {
      graphData: this.getSampleGraphData(),
      historyData: this.getSampleHistoryData(),
      allocationMatrix: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ],
      maxMatrix: [
        [2, 1, 1],
        [1, 1, 1],
        [1, 0, 2]
      ],
      availableResources: [1, 1, 0]
    };
  }
  
  detectDeadlockWithBankersAlgorithm(allocation, max, available) {
    const processes = allocation.length;
    const resources = available.length;
    
    // Calculate need matrix
    const need = Array(processes).fill().map((_, i) => 
      Array(resources).fill().map((_, j) => max[i][j] - allocation[i][j])
    );
    
    // Initialize work and finish arrays
    const work = [...available];
    const finish = Array(processes).fill(false);
    const safeSequence = [];
    
    // Find a safe sequence if one exists
    let count = 0;
    while (count < processes) {
      let found = false;
      
      for (let i = 0; i < processes; i++) {
        if (!finish[i]) {
          let canAllocate = true;
          
          for (let j = 0; j < resources; j++) {
            if (need[i][j] > work[j]) {
              canAllocate = false;
              break;
            }
          }
          
          if (canAllocate) {
            for (let j = 0; j < resources; j++) {
              work[j] += allocation[i][j];
            }
            
            finish[i] = true;
            safeSequence.push(i);
            found = true;
            count++;
          }
        }
      }
      
      if (!found) {
        break;
      }
    }
    
    return {
      isSafe: count === processes,
      safeSequence: safeSequence.map(i => `P${i + 1}`),
      deadlockedProcesses: finish.map((f, i) => !f ? `P${i + 1}` : null).filter(p => p !== null)
    };
  }
  
  updateSystemStatus(deadlockStatus) {
    const statusMessage = document.getElementById('status-message');
    const statusContainer = document.querySelector('.result-status');
    
    if (deadlockStatus.isSafe) {
      statusContainer.className = 'result-status status-safe';
      statusMessage.innerHTML = 'No deadlock detected in the current system state. The system is in a safe state.';
    } else {
      statusContainer.className = 'result-status status-danger';
      statusMessage.innerHTML = `Deadlock detected involving processes: ${deadlockStatus.deadlockedProcesses.join(', ')}. The system is in an unsafe state.`;
    }
  }

  getSampleGraphData() {
    return {
      nodes: [
        { id: 'P1', type: 'process' },
        { id: 'P2', type: 'process' },
        { id: 'P3', type: 'process' },
        { id: 'R1', type: 'resource' },
        { id: 'R2', type: 'resource' },
        { id: 'R3', type: 'resource' }
      ],
      links: [
        { source: 'R1', target: 'P1', value: 1 },
        { source: 'R2', target: 'P2', value: 1 },
        { source: 'R2', target: 'P3', value: 1 },
        { source: 'R3', target: 'P1', value: 1 }
      ]
    };
  }

  getSampleHistoryData() {
    return [
      {
        timestamp: new Date().toLocaleString(),
        eventType: 'Resource Allocation',
        description: 'Process P1 acquired Resource R1',
        status: 'Success'
      },
      {
        timestamp: new Date().toLocaleString(),
        eventType: 'Resource Request',
        description: 'Process P2 waiting for Resource R3',
        status: 'Pending'
      }
    ];
  }

  updateStatus(result) {
    const statusDiv = document.querySelector('.result-status');
    const statusMessage = document.getElementById('status-message');

    if (result.deadlock_detected) {
      statusDiv.className = 'result-status status-deadlock';
      statusMessage.textContent = `Deadlock detected! Processes involved: ${result.deadlocked_processes.join(', ')}`;
    } else {
      statusDiv.className = 'result-status status-safe';
      statusMessage.textContent = 'No deadlock detected in the current system state.';
    }
  }

  updateResourceGraph(systemState) {
    // Clear existing graph
    this.svg.selectAll('*').remove();

    // Create nodes for processes and resources
    const nodes = [];
    const links = [];

    // Add process nodes
    systemState.processes.forEach((p, i) => {
      nodes.push({
        id: p,
        type: 'process',
        name: p
      });
    });

    // Add resource nodes
    systemState.resources.forEach((r, i) => {
      nodes.push({
        id: r,
        type: 'resource',
        name: r
      });
    });

    // Create links based on allocation and request matrices
    systemState.processes.forEach((p, i) => {
      systemState.resources.forEach((r, j) => {
        if (systemState.allocation[i][j] > 0) {
          links.push({
            source: r,
            target: p,
            value: systemState.allocation[i][j],
            type: 'allocation'
          });
        }
        if (systemState.request[i][j] > 0) {
          links.push({
            source: p,
            target: r,
            value: systemState.request[i][j],
            type: 'request'
          });
        }
      });
    });

    // Create SVG elements
    const link = this.svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('stroke', d => d.type === 'allocation' ? '#2ecc71' : '#e74c3c');

    const node = this.svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g');

    node.append('circle')
      .attr('r', 10)
      .attr('fill', d => d.type === 'process' ? '#3498db' : '#f1c40f');

    node.append('text')
      .text(d => d.name)
      .attr('x', 12)
      .attr('y', 3);

    // Update force simulation
    this.simulation
      .nodes(nodes)
      .on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('transform', d => `translate(${d.x},${d.y})`);
      });

    this.simulation.force('link')
      .links(links);

    this.simulation.alpha(1).restart();
  }

  updateMetrics(result) {
    const systemState = result.system_state;
    
    // Update process chart
    const processData = systemState.processes.map((p, i) => {
      return systemState.allocation[i].reduce((a, b) => a + b, 0);
    });

    this.processChart.data.labels = systemState.processes;
    this.processChart.data.datasets[0].data = processData;
    this.processChart.update();

    // Update resource chart
    const resourceData = systemState.available;
    const colors = systemState.resources.map((_, i) => {
      const hue = (i * 360) / systemState.resources.length;
      return [`hsla(${hue}, 70%, 60%, 0.5)`, `hsla(${hue}, 70%, 60%, 1)`];
    });

    this.resourceChart.data.labels = systemState.resources;
    this.resourceChart.data.datasets[0].data = resourceData;
    this.resourceChart.data.datasets[0].backgroundColor = colors.map(c => c[0]);
    this.resourceChart.data.datasets[0].borderColor = colors.map(c => c[1]);
    this.resourceChart.update();
  }
  }

  updateHistory(data) {
    const tbody = document.getElementById('history-data');
    tbody.innerHTML = '';

    data.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.timestamp}</td>
        <td>${entry.eventType}</td>
        <td>${entry.description}</td>
        <td>${entry.status}</td>
      `;
      tbody.appendChild(row);
    });
  }


  
  updateAIRecommendations(simulationResult) {
    const list = document.getElementById('recommendation-list');
    const performanceAnalysis = document.getElementById('performance-analysis');
    
    // Clear existing recommendations
    list.innerHTML = '';
    
    // Analyze current system state
    const systemState = simulationResult.system_state;
    const deadlockStatus = this.detectDeadlockWithBankersAlgorithm(
      systemState.allocation,
      systemState.max,
      systemState.available
    );
    
    // Generate real-time recommendations based on system state
    const recommendations = [];
    const resourceUtilization = systemState.allocation.map(row =>
      row.reduce((sum, val) => sum + val, 0)
    );
    
    if (!deadlockStatus.isSafe) {
      recommendations.push(
        `Immediate action required: Deadlock detected involving processes ${deadlockStatus.deadlockedProcesses.join(', ')}`,
        `Release resources from blocked processes: ${deadlockStatus.deadlockedProcesses.join(', ')}`,
        'Consider process termination to break deadlock cycle',
        `Optimize resource allocation for processes: ${systemState.processes.join(', ')}`
      );
      
      performanceAnalysis.innerHTML = `
        <strong>⚠️ Critical Alert:</strong> System in unsafe state.
        <br>Deadlocked Processes: ${deadlockStatus.deadlockedProcesses.join(', ')}
        <br>Current Resource Utilization: ${Math.round(resourceUtilization.reduce((a,b) => a + b, 0) / systemState.resources.length * 100)}%
        <br>Required Action: Implement deadlock recovery protocol
      `;
    } else {
      const safeSeq = deadlockStatus.safeSequence;
      recommendations.push(
        `Safe execution sequence verified: ${safeSeq.join(' → ')}`,
        `Resource utilization is at ${Math.round(resourceUtilization.reduce((a,b) => a + b, 0) / systemState.resources.length * 100)}%`,
        'System is maintaining deadlock-free state',
        'Continue monitoring resource request patterns'
      );
      
      performanceAnalysis.innerHTML = `
        <strong>✅ System Safe:</strong>
        <br>Safe Sequence: ${safeSeq.join(' → ')}
        <br>All process requests can be satisfied
        <br>Resource Allocation: Optimal
      `;
    }
    
    // Update recommendation list
    recommendations.forEach(rec => {
      const li = document.createElement('li');
      li.textContent = rec;
      list.appendChild(li);
    });
    
    // Update status indicators
    const statusDiv = document.querySelector('.result-status');
    statusDiv.className = `result-status ${deadlockStatus.isSafe ? 'status-safe' : 'status-danger'}`;
    document.getElementById('status-message').textContent = deadlockStatus.isSafe ?
      'No deadlock detected. System is in a safe state.' :
      `Deadlock detected involving processes: ${deadlockStatus.deadlockedProcesses.join(', ')}`;
  
        performanceAnalysis.innerHTML = `
          The system is currently operating efficiently with proper resource management.
          No immediate actions required.
        `;
      }
    }
    
    list.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
  }

  exportResults() {
    // In a real application, this would export data to a file
    alert('Results exported successfully!');
  }

  clearHistory() {
    if (confirm('Are you sure you want to clear the simulation history?')) {
      document.getElementById('history-data').innerHTML = '';
    }
  }

  dragstarted(event) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  dragended(event) {
    if (!event.active) this.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
}

// Initialize visualization when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new ResultsVisualization();
});