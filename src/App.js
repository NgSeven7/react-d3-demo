import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'
import { isEmpty } from 'lodash';

import './App.css';

const csv = [
    {
        id: 'case_1',
        paths: [
            { id: 'Flow00000', taskId: 'case_1', source: "Start", target: "Microsoft", href:'Start00001', startTime: '2021-05-11 09:32:00', endTime: '2021-05-11 15:33:01' },
            { id: 'Flow00001', taskId: 'case_1', source: "Microsoft", target: "Samsung", href:'Flow00001', startTime: '2021-05-11 15:33:01', endTime: '2021-05-12 08:32:01' },
            { id: 'Flow00002', taskId: 'case_1', source: "Samsung", target: "Motorola",  href:'Flow00002', startTime: '2021-05-12 09:32:01', endTime: '2021-05-12 18:32:01' },
            { id: 'Flow00003', taskId: 'case_1', source: "Motorola", target: "Amazon",  href:'Flow00003', startTime: '2021-05-13 09:32:01', endTime: '2021-05-13 10:32:01' },
            { id: 'Flow00004', taskId: 'case_1', source: "Amazon", target: "HTC",  href:'Flow00004', startTime: '2021-05-13 19:32:01', endTime: '2021-05-14 02:32:01' },
            { id: 'Flow00005', taskId: 'case_1', source: "HTC", target: "Apple",  href:'Flow00005', startTime: '2021-05-14 06:32:01', endTime: '2021-05-14 08:32:01' },
            { id: 'Flow00006', taskId: 'case_1', source: "Apple", target: "Galaxy",  href:'Flow00008', startTime: '2021-05-14 09:32:01', endTime: '2021-05-14 18:32:01' }
        ]
    }
];

const preData = {
  nodes: [
    { id: "Start", x: -70, y: -220, width: 120, height: 35, hrs: '28.4 hrs', tasks: 0, isStart: true },
    { id: "Microsoft", x: -180, y: -120, width: 120, height: 35, hrs: '28.4 hrs', tasks: 16 },
    { id: "Huawei", x: 40, y: -120, width: 120, height: 35, hrs: '28.4 hrs', tasks: 16 },
    { id: "Samsung", x: -80, y: -40, width: 120, height: 35, hrs: '90 secs', tasks: 6 },
    { id: "Motorola", x: -260, y: -40, width: 120, height: 35, hrs: '2 mins', tasks: 64 },
    { id: "Amazon", x: -200, y: 100, width: 120, height: 35, hrs: '60 secs', tasks: 166 },
    { id: "HTC", x: 120, y: -40, width: 120, height: 35, hrs: '23 mins', tasks: 65 },
    { id: "Apple", x: 40, y: 100, width: 120, height: 35, hrs: '6.4 hrs', tasks: 46 },
    { id: "Galaxy", x: 380, y: -70, width: 120, height: 35, hrs: '6.4 hrs', tasks: 46, isEnd: true }
  ],
    links: [
    { id: 'Start00001', taskId: 'Task00001', source: "Start", target: "Microsoft", type: "suit", startTime: '2021-05-11 09:32:00', endTime: '2021-05-11 09:32:01'},
    { id: 'Start00002', taskId: 'Task00001', source: "Start", target: "Huawei", type: "suit", startTime: '2021-05-11 09:32:00', endTime: '2021-05-11 09:32:01'},
    { id: 'Flow00001', taskId: 'Task00001', source: "Microsoft", target: "Samsung", type: "licensing", startTime: '2021-05-11 09:32:01', endTime: '2021-05-12 08:32:01' },
    { id: 'Flow00002', taskId: 'Task00001', source: "Samsung", target: "Motorola", type: "resolved", startTime: '2021-05-12 08:32:01', endTime: '2021-05-13 07:32:01' },
    { id: 'Flow00003', taskId: 'Task00001', source: "Motorola", target: "Amazon", type: "resolved", startTime: '2021-05-13 07:32:01', endTime: '2021-05-14 08:52:01' },
    { id: 'Flow00004', taskId: 'Task00001', source: "Amazon", target: "HTC", type: "suit", startTime: '2021-05-14 08:52:01', endTime: '2021-05-15 09:42:01' },
    { id: 'Flow00005', taskId: 'Task00001', source: "HTC", target: "Apple", type: "suit", startTime: '2021-05-15 09:42:01', endTime: '2021-05-16 10:32:01' },
    { id: 'Flow00006', taskId: 'Task00001', source: "Motorola", target: "HTC", type: "resolved", startTime: '2021-05-16 10:32:01', endTime: '2021-05-16 10:42:01' },
    { id: 'Flow00007', taskId: 'Task00001', source: "Amazon", target: "Apple", type: "licensing", startTime: '2021-05-16 10:42:01', endTime: '2021-05-16 10:52:01' },
    { id: 'Flow00008', taskId: 'Task00001', source: "Apple", target: "Galaxy", type: "licensing", startTime: '2021-05-16 10:42:01', endTime: '2021-05-16 10:55:01' }
  ]
};

function App() {
  const [data, setData] = useState(preData);
  let isPause = false;
  let isStart = false;
  let begin = 0;
  const types = ["licensing", "suit", "resolved"];
  const color = d3.scaleOrdinal(types, d3.schemeCategory10);
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  const calcConnectPoint = d => {
    const { source, target } = d;
    let point = {
      source: {},
      target: {},
      type: 'L',
      sweep: 1
    };

    if ((Math.abs(source.x - target.x) >= 2.5 * Math.max(source.width, target.width)) || (Math.abs(source.y - target.y) >= 5 * Math.max(source.height, target.height))) {
      point.type = 'A'
    }
    const distance = source.x - target.x;

    if (target.y > source.y) {
      point.source = {
        x: source.x + (source.width / 2),
        y: source.y + source.height
      };
      point.target = {
        x: target.x + (target.width / 2),
        y: target.y
      };
      if (point.type === 'A') {
        point.sweep = 0;
        if (distance > 0) {
          point.source = {
            x: source.x + (source.width / 2),
            y: source.y + source.height
          };
          point.target = {
            x: target.x + target.width,
            y: target.y
          };
        } else if (distance < 0) {
          point.source = {
            x: source.x + (source.width / 2),
            y: source.y + source.height
          };
          point.target = {
            x: target.x,
            y: target.y
          };
        }
      }
    } else if (target.y < source.y) {
      point.source = {
        x: source.x + (source.width / 2),
        y: source.y
      };
      point.target = {
        x: target.x + (target.width / 2),
        y: target.y + target.height
      };
      if (point.type === 'A') {
        if (distance > 0) {
          point.sweep = 0;
          point.source = {
            x: source.x + (source.width / 2),
            y: source.y
          };
          point.target = {
            x: target.x + target.width,
            y: target.y + target.height
          };
        } else if (distance < 0) {
          point.sweep = 1;
          point.source = {
            x: source.x + (source.width / 2),
            y: source.y
          };
          point.target = {
            x: target.x,
            y: target.y + target.height
          };
        }
      }
    } else {
      if (distance > 0) {
        point.source = {
          x: source.x,
          y: point.type === 'A' ? source.y + source.height : source.y + source.height / 2
        };
        point.target = {
          x: target.x + target.width,
          y: point.type === 'A' ? target.y + target.height : target.y + target.height / 2
        }
      } else {
        point.source = {
          x: source.x + source.width,
          y: point.type === 'A' ? source.y : source.y + source.height / 2
        };
        point.target = {
          x: target.x,
          y: point.type === 'A' ? target.y : target.y + target.height / 2
        }
      }
    }
    return point;
  };

  const calcDate = (start, end) => {
    const sTime = new Date(start).getTime();
    const eTime = new Date(end).getTime();
    return (eTime - sTime) / 1000 / 60 / 60
  };

  // const handle = data => {
  //     let result={
  //         source:[],
  //         target:[]
  //     };
  //     result.source[0]=data.source.x
  //     result.source[1]=data.source.y
  //     result.target[0]=data.target.x
  //     result.target[1]=data.target.y
  //     return result
  // };

  const linkArc = d => {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    const point = calcConnectPoint(d);
    // const link = d3.linkHorizontal();
    // return link(handle(point))
    return point.type === 'A' ? `
    M${point.source.x},${point.source.y}
    A${r},${r} 1 0,${point.sweep} ${point.target.x},${point.target.y}
  ` : `
    M${point.source.x},${point.source.y}
    L${point.target.x},${point.target.y}
  `;
  };

    const getStrokeWidth = d => {
        const isStart = data.nodes.find(item => item.id === d.__proto__.source).isStart
        const isEnd = data.nodes.find(item => item.id === d.__proto__.target).isEnd
        if (!isStart && !isEnd) {
            return 1.5
        } else {
            return null
        }
    };

    const getStrokeDash = d => {
        const isStart = data.nodes.find(item => item.id === d.__proto__.source).isStart;
        const isEnd = data.nodes.find(item => item.id === d.__proto__.target).isEnd;
        if (isStart || isEnd) {
            return "5,5"
        } else {
            return null
        }
    };

    const processAnimation = svg => {
        const timeAccumulator = d => {
            const dur = calcDate(d.startTime, d.endTime) < 1 ? 1 : calcDate(d.startTime,d.endTime);
            begin += dur;
            return `${dur}s`
        };

        if(!isEmpty(csv)){
            csv.forEach((item,csvIndex) => {
                const { id, paths } = item;
                const circle = svg.append('circle')
                    .attr('id',id)
                    .attr('r',3)
                    .attr('fill','#000');

                paths.forEach((path,index) => {
                    const animateMotion = circle.append('animateMotion')
                        .attr('begin',() => `${begin}s`)
                        .attr('dur',timeAccumulator(path))
                    if(index + 1 === paths.length){
                        animateMotion.on('endEvent',() => {
                            svg.selectAll(`#${id}`).remove()
                            if(csvIndex + 1 === csv.length){
                                isStart = false;
                            }
                        })
                    }
                    animateMotion.append('mpath')
                        .attr('xlink:href',`#${path.href}`);
                })
            });
            isStart = true
        }
    };

  const draw = () => {
    d3.forceSimulation(nodes).force("link", d3.forceLink(links).id(d => d.id));

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

      const link = svg.append("g")
          .attr("fill", "currentColor")
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .selectAll("g")
          .data(links)
          .join("g");

      const path = link.append("path")
          .attr('id', d => d.id)
          .attr("fill", "none")
          .attr("stroke", d => color(d.type))
          .attr("stroke-width", getStrokeWidth)
          .attr("stroke-dasharray", getStrokeDash)
          .attr("marker-end", "url(#end)")
          .attr("d", linkArc);

      let linkLabelPoint = []
      path._groups && path._groups[0].map((item, index) => {
          const pathLen = item.getTotalLength();
          const point = item.getPointAtLength(pathLen / 2);
          linkLabelPoint.push(point)
          links[index].linkLabelPoint = point
      });

      link.append('rect')
          .attr('x', d => d.linkLabelPoint.x - 20)
          .attr('y', d => d.linkLabelPoint.y - 10)
          .attr('width', 40).attr('height', 20)
          .attr("fill-opacity", 0.8)
          .attr('fill', '#fff');

      link.append("text")
          .text(d => `${Math.round(calcDate(d.startTime, d.endTime) * 100) / 100}hrs`)
          .attr('x', d => d.linkLabelPoint.x - 15)
          .attr('y', d => d.linkLabelPoint.y + 5)
          .attr('font-size', "9px")
          .attr('font-family', "PingFang SC")
          .attr('font-weight', 500)
          .clone(true).lower()
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 1);

  const node = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .on('click',(e,d) => {
          if(d.id === 'Start'){
              if(isStart){
                  if(!isPause){
                      svg.node().pauseAnimations();
                  }else{
                      svg.node().unpauseAnimations();
                  }
                  isPause = !isPause;
              } else {
                  processAnimation(svg);
              }
          }
      });

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

      node.append('rect')
          .attr('x', d => d.x + 7.5)
          .attr('y', d => d.y + 7.5)
          .attr('width', 20)
          .attr('height', 20)
          .attr('rx', 5)
          .attr('ry', 5)
          .attr("stroke", "black")
          .attr("stroke-width", 0.1)
          .attr('fill', '#FFB238');

      node.append("text")
          .attr("x", d => d.x + 32)
          .attr("y", d => d.y + 16)
          .text(d => d.id)
          .clone(true).lower()
          .attr('font-size', "12px")
          .attr('font-weight', "bold")
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 1);

      node.append("text")
          .attr("x", d => d.x + 32)
          .attr("y", d => d.y + 30)
          .text(d => `${d.hrs}`)
          .attr('font-size', "9px")
          .attr('font-family', "PingFang SC")
          .attr('font-weight', 500)
          .clone(true).lower()
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 1);

      node.append("text")
          .attr("x", d => d.x + 80)
          .attr("y", d => d.y + 30)
          .text(d => `(${d.tasks})`)
          .attr('color', "#7384A5")
          .attr('font-size', "9px")
          .attr('font-family', "PingFang SC")
          .attr('font-weight', 500)
          .clone(true).lower()
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 1);
    return svg
  };

  useEffect(() => {
    const temp = document.getElementsByClassName('App')[0];
    temp.append(draw().node())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[data]);

  return(
    <div className="App"/>
  );
}

export default App;
