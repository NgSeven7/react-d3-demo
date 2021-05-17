import React, { useEffect } from 'react';
import * as d3 from 'd3'

import './App.css';

function App(props) {
  const types = ["licensing", "suit", "resolved"];
  const color = d3.scaleOrdinal(types, d3.schemeCategory10);
  const data = {
    nodes: [
      {id: "Microsoft", x:-60, y:-180, width:120, height:35},
      {id: "Samsung", x:-80, y:-40, width:120, height:35},
      {id: "Motorola", x:-260, y:-40, width:120, height:35},
      {id: "Amazon", x:-200, y:100, width:120, height:35},
      {id: "HTC", x:120, y:-40, width:120, height:35},
      {id: "Apple", x:40, y:100, width:120, height:35}
    ],
    links: [
      {source: "Microsoft", target: "Amazon", type: "licensing"},
      {source: "Microsoft", target: "Amazon", type: "licensing"},
      {source: "HTC", target: "Microsoft", type: "licensing"},
      {source: "Samsung", target: "Apple", type: "suit"},
      {source: "Motorola", target: "Apple", type: "suit"}
    ]
  };

  const calcConnectPoint = d => {
    const { source, target } = d;
    let point = {
      source:{},
      target:{}
    };
    if(target.y > source.y){
      point.source = {
        x:source.x + (source.width / 2),
        y:source.y + source.height
      };
      point.target = {
        x:target.x + (target.width / 2),
        y:target.y
      }
    }else{
      point.source = {
        x:source.x + (source.width / 2),
        y:source.y
      };
      point.target = {
        x:target.x + (target.width / 2),
        y:target.y + target.height
      }
    }
    return point;
  };

  const linkArc = d => {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    const point = calcConnectPoint(d);
    return `
    M${point.source.x},${point.source.y}
    A${r},${r} 1 0,1 ${point.target.x},${point.target.y}
  `;
  };

  const draw = () => {
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("x", d3.forceX())
        .force("y", d3.forceY());
    console.log('simulation',simulation);

    const svg = d3.create('svg')
        .attr("viewBox", [-960 / 2, -960 / 2, 960, 960])
        .style("font", "12px sans-serif");


  //Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
      .data(types)
      .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", color)
      .attr("d", "M0,-5L10,0L0,5");

    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 11)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", d => color(d.type))
      .attr("marker-end", "url(#end)")
      .attr("d", linkArc);

  const node = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")

  const rect = node.append('rect')
      .attr('x',d=> d.x)
      .attr('y',d => d.y)
      .attr('width',d=>d.width)
      .attr('height',35)
      .attr('rx',5)
      .attr('ry',5)
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr('fill','#fff');

    node.append("text")
      .attr("x", d=> d.x + 20)
      .attr("y", d => d.y + 20)
      .text(d => d.id)
      .clone(true).lower()
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1);
    return svg.node()
  };

  useEffect(() => {
    const temp = document.getElementsByClassName('App')[0];
    temp.append(draw())
  },[]);
  return(
    <div className="App"/>
  );
}

export default App;
