import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'

import './App.css';

const preData = {
  nodes: [
    { id: "Microsoft", x: -60, y: -180, width: 120, height: 35 },
    { id: "Samsung", x: -80, y: -40, width: 120, height: 35 },
    { id: "Motorola", x: -260, y: -40, width: 120, height: 35 },
    { id: "Amazon", x: -200, y: 100, width: 120, height: 35 },
    { id: "HTC", x: 120, y: -40, width: 120, height: 35 },
    { id: "Apple", x: 40, y: 100, width: 120, height: 35 }
  ],
  links: [
    { id: 'Flow00001', taskId: 'Task00001', source: "Microsoft", target: "Samsung", type: "licensing", startTime: '2021-05-11 09:32:01', endTime: '2021-05-12 08:32:01' },
    { id: 'Flow00002', taskId: 'Task00001', source: "Samsung", target: "Motorola", type: "resolved", startTime: '2021-05-12 08:32:01', endTime: '2021-05-13 07:32:01' },
    { id: 'Flow00003', taskId: 'Task00001', source: "Motorola", target: "Amazon", type: "resolved", startTime: '2021-05-13 07:32:01', endTime: '2021-05-14 08:52:01' },
    { id: 'Flow00004', taskId: 'Task00001', source: "Amazon", target: "HTC", type: "suit", startTime: '2021-05-14 08:52:01', endTime: '2021-05-15 09:42:01' },
    { id: 'Flow00005', taskId: 'Task00001', source: "HTC", target: "Apple", type: "suit", startTime: '2021-05-15 09:42:01', endTime: '2021-05-16 10:32:01' },
    { id: 'Flow00006', taskId: 'Task00001', source: "Motorola", target: "HTC", type: "resolved", startTime: '2021-05-16 10:32:01', endTime: '2021-05-16 10:42:01' },
    { id: 'Flow00007', taskId: 'Task00001', source: "Amazon", target: "Apple", type: "licensing", startTime: '2021-05-16 10:42:01', endTime: '2021-05-16 10:52:01' }
  ]
};

function App() {
  const [data, setData] = useState(preData);
  const types = ["licensing", "suit", "resolved"];
  const color = d3.scaleOrdinal(types, d3.schemeCategory10);

  const calcConnectPoint = d => {
    const { source, target } = d;
    let point = {
      source: {},
      target: {},
      type: 'L',
      sweep: 1
    };

    if((Math.abs(source.x - target.x) >= 2.5 * Math.max(source.width, target.width)) || (Math.abs(source.y - target.y) >= 5 * Math.max(source.height, target.height))){
      point.type = 'A'
    }
    const distance = source.x - target.x;

    if(target.y > source.y){
      point.source = {
        x:source.x + (source.width / 2),
        y:source.y + source.height
      };
      point.target = {
        x:target.x + (target.width / 2),
        y:target.y
      };
      if(point.type === 'A'){
        point.sweep = 0;
        if(distance > 0){
          point.source = {
            x:source.x + (source.width / 2),
            y:source.y + source.height
          };
          point.target = {
            x:target.x + target.width,
            y:target.y
          };
        }else if(distance < 0){
          point.source = {
            x:source.x + (source.width / 2),
            y:source.y + source.height
          };
          point.target = {
            x:target.x,
            y:target.y
          };
        }
      }
    }else if(target.y < source.y){
      point.source = {
        x:source.x + (source.width / 2),
        y:source.y
      };
      point.target = {
        x:target.x + (target.width / 2),
        y:target.y + target.height
      };
      if(point.type === 'A'){
        if(distance > 0){
          point.sweep = 0;
          point.source = {
            x:source.x + (source.width / 2),
            y:source.y
          };
          point.target = {
            x:target.x + target.width,
            y:target.y +target.height
          };
        }else if(distance < 0){
          point.sweep = 1;
          point.source = {
            x:source.x + (source.width / 2),
            y:source.y
          };
          point.target = {
            x:target.x,
            y:target.y + target.height
          };
        }
      }
    }else{
      if(distance > 0){
        point.source = {
          x:source.x,
          y:point.type === 'A' ? source.y + source.height : source.y + source.height / 2
        };
        point.target = {
          x:target.x + target.width,
          y:point.type === 'A' ? target.y + target.height : target.y  + target.height / 2
        }
      }else{
        point.source = {
          x:source.x + source.width,
          y:point.type === 'A' ? source.y : source.y + source.height / 2
        };
        point.target = {
          x:target.x,
          y:point.type === 'A' ? target.y : target.y  + target.height / 2
        }
      }
    }
    return point;
  };

  const calcDate = (start,end) => {
    const sTime = new Date(start).getTime();
    const eTime = new Date(end).getTime();
    console.log('###',(eTime - sTime) / 1000 / 60)
    return (eTime - sTime) / 1000 / 60 / 60


  };

  const linkArc = d => {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    const point = calcConnectPoint(d);
    return point.type === 'A' ? `
    M${point.source.x},${point.source.y}
    A${r},${r} 1 0,${point.sweep} ${point.target.x},${point.target.y}
  ` : `
    M${point.source.x},${point.source.y}
    L${point.target.x},${point.target.y}
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

    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 9)
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
      .attr('id',d => d.id)
      .attr("marker-end", "url(#end)")
      .attr("d", linkArc);

    svg.append('g')
        .selectAll("circle")
        .data(links)
        .join('circle')
        .attr('r',3)
        .attr('fill','#000')
        .append('animateMotion')
        .attr('dur',d => `${calcDate(d.startTime,d.endTime)}s`)
        .append('mpath')
        .attr('xlink:href',d => `#${d.id}`);

  const node = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g");

    node.append('rect')
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return(
    <div className="App"/>
  );
}

export default App;
