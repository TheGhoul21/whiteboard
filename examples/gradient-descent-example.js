// Example: Gradient Descent Visualization using Precompute/Render API
// This demonstrates the compute/render separation for high-performance animations

const steps = slider('Steps', 10, 500, 100);
const learningRate = slider('Learning Rate', 0.01, 0.5, 0.1);

// Make sure output element exists
if (!output) {
  console.error('Output element not found');
}

// PHASE 1: Precompute - Run once, expensive calculations here
precompute((registerFrame) => {
  let w = 0;  // Initial weight
  const trajectory = [];
  
  for (let i = 0; i <= steps; i++) {
    // Compute gradient: d/dw of w^2 = 2w
    const gradient = 2 * w;
    const loss = w * w;
    
    // Store current state
    trajectory.push({ step: i, w, loss });
    
    // Register this frame's data
    registerFrame(i, {
      step: i,
      weight: w,
      loss: loss,
      gradient: gradient,
      trajectory: [...trajectory]  // Copy of trajectory up to this point
    });
    
    // Update weight using gradient descent
    w = w - learningRate * gradient;
  }
});

// PHASE 2: Render - Run every animation frame, FAST declarative rendering
render((frameIndex, frameData, controlValues) => {
  // Safety check: ensure frameData exists
  if (!frameData) {
    console.log('Render called but no frame data available yet');
    d3.select(output).append('div')
      .style('padding', '20px')
      .style('color', '#666')
      .text('Initializing... (Run the code block first)');
    return;
  }
  
  // Log for debugging
  console.log('Rendering frame:', frameIndex, 'Data:', frameData);
  
  const { step, weight, loss, gradient, trajectory } = frameData;
  
  // Clear previous render (declarative approach)
  const svg = d3.select(output).html('').append('svg')
    .attr('width', 450)
    .attr('height', 350);
  
  // Scales
  const xScale = d3.scaleLinear()
    .domain([0, controlValues.Steps])
    .range([50, 400]);
  
  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([300, 50]);
  
  // Draw axes
  svg.append('g')
    .attr('transform', 'translate(0,300)')
    .call(d3.axisBottom(xScale).ticks(5));
  
  svg.append('g')
    .attr('transform', 'translate(50,0)')
    .call(d3.axisLeft(yScale).ticks(5));
  
  // Draw loss curve up to current step
  const line = d3.line()
    .x(d => xScale(d.step))
    .y(d => yScale(d.loss))
    .curve(d3.curveMonotoneX);
  
  svg.append('path')
    .datum(trajectory)
    .attr('fill', 'none')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 2)
    .attr('d', line);
  
  // Draw current point
  svg.append('circle')
    .attr('cx', xScale(step))
    .attr('cy', yScale(loss))
    .attr('r', 6)
    .attr('fill', '#ef4444');
  
  // Labels
  svg.append('text')
    .attr('x', 225)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text(`Step ${step}: w = ${weight.toFixed(4)}, loss = ${loss.toFixed(4)}`);
  
  svg.append('text')
    .attr('x', 225)
    .attr('y', 335)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Training Step');
  
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -175)
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Loss');
});

// Create animation using the precomputed frames
const anim = createAnimation();
for (let i = 0; i <= steps; i++) {
  anim.addKeyframe(i * 0.05, { 'Steps': i }, `Step ${i}`);
}
anim.save({ duration: steps * 0.05, fps: 60 });
