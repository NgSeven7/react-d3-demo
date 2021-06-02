import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'
import { isEmpty, findIndex } from 'lodash';

import './App.css';

const preCsv = [
  {
    id: 'case_1',
    paths: [
      { caseId: 'case_1', source: "Start", target: "Microsoft", href: 'Start00001', startTime: '2021-05-11 09:32:00', endTime: '2021-05-11 09:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_1', source: "Microsoft", target: "Samsung", href: 'Flow00001', startTime: '2021-05-11 15:33:01', endTime: '2021-05-12 08:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_1', source: "Samsung", target: "Motorola", href: 'Flow00002', startTime: '2021-05-12 09:32:01', endTime: '2021-05-12 18:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_1', source: "Motorola", target: "Amazon", href: 'Flow00003', startTime: '2021-05-13 09:32:01', endTime: '2021-05-13 10:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_1', source: "Amazon", target: "HTC", href: 'Flow00004', startTime: '2021-05-13 19:32:01', endTime: '2021-05-14 02:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_1', source: "HTC", target: "Apple", href: 'Flow00005', startTime: '2021-05-14 06:32:01', endTime: '2021-05-14 08:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_1', source: "Apple", target: "End", href: 'End00001', startTime: '2021-05-14 09:32:01', endTime: '2021-05-14 18:32:01', pathDur: 86400, activityDur: 4000 }
    ]
  },
  {
    id: 'case_2',
    paths: [
      { caseId: 'case_2', source: "Start", target: "Microsoft", href: 'Start00001', startTime: '2021-05-11 14:32:00', endTime: '2021-05-11 17:33:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_2', source: "Microsoft", target: "Samsung", href: 'Flow00001', startTime: '2021-05-11 17:33:01', endTime: '2021-05-12 09:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_2', source: "Samsung", target: "Motorola", href: 'Flow00002', startTime: '2021-05-12 09:32:01', endTime: '2021-05-12 13:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_2', source: "Motorola", target: "HTC", href: 'Flow00006', startTime: '2021-05-13 13:32:01', endTime: '2021-05-13 23:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_2', source: "HTC", target: "Apple", href: 'Flow00005', startTime: '2021-05-14 23:32:01', endTime: '2021-05-14 12:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_2', source: "Apple", target: "End", href: 'End00001', startTime: '2021-05-14 12:32:01', endTime: '2021-05-14 22:32:01', pathDur: 86400, activityDur: 4000 }
    ]
  },
  {
    id: 'case_3',
    paths: [
      { caseId: 'case_3', source: "Start", target: "Microsoft", href: 'Start00001', startTime: '2021-05-12 08:32:00', endTime: '2021-05-12 17:33:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_3', source: "Microsoft", target: "Samsung", href: 'Flow00001', startTime: '2021-05-12 17:33:01', endTime: '2021-05-12 23:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_3', source: "Samsung", target: "Motorola", href: 'Flow00002', startTime: '2021-05-12 23:32:01', endTime: '2021-05-13 13:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_3', source: "Motorola", target: "Amazon", href: 'Flow00003', startTime: '2021-05-13 13:32:01', endTime: '2021-05-13 22:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_3', source: "Amazon", target: "Apple", href: 'Flow00007', startTime: '2021-05-13 22:32:01', endTime: '2021-05-14 12:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_3', source: "Apple", target: "End", href: 'End00001', startTime: '2021-05-14 12:32:01', endTime: '2021-05-14 22:32:01', pathDur: 86400, activityDur: 4000, isEnd: true }
    ]
  },
  {
    id: 'case_4',
    paths: [
      { caseId: 'case_4', source: "Start", target: "Huawei", href: 'Start00002', startTime: '2021-05-12 08:32:00', endTime: '2021-05-12 17:33:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_4', source: "Huawei", target: "HTC", href: 'Flow00008', startTime: '2021-05-12 17:33:01', endTime: '2021-05-12 23:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_4', source: "HTC", target: "Apple", href: 'Flow00005', startTime: '2021-05-13 22:32:01', endTime: '2021-05-14 12:32:01', pathDur: 86400, activityDur: 4000 },
      { caseId: 'case_4', source: "Apple", target: "End", href: 'End00001', startTime: '2021-05-14 12:32:01', endTime: '2021-05-14 22:32:01', pathDur: 86400, activityDur: 4000 }
    ]
  }
];

const preData = {
  nodes: [
    { id: "Start", className: 'start', x: -20, y: -220, width: 30, height: 30, r: 15, isStart: true },
    { id: "Microsoft", className: 'node', x: -180, y: -120, width: 120, height: 35, hrs: '28.4 hrs', tasks: 16 },
    { id: "Huawei", className: 'node', x: 40, y: -120, width: 120, height: 35, hrs: '28.4 hrs', tasks: 16 },
    { id: "Samsung", className: 'node', x: -80, y: -40, width: 120, height: 35, hrs: '90 secs', tasks: 6 },
    { id: "Motorola", className: 'node', x: -260, y: -40, width: 120, height: 35, hrs: '2 mins', tasks: 64 },
    { id: "Amazon", className: 'node', x: -200, y: 100, width: 120, height: 35, hrs: '60 secs', tasks: 166 },
    { id: "HTC", className: 'node', x: 120, y: -40, width: 120, height: 35, hrs: '23 mins', tasks: 65 },
    { id: "Apple", className: 'node', x: 40, y: 100, width: 120, height: 35, hrs: '6.4 hrs', tasks: 46 },
    { id: "End", className: 'end', x: 380, y: -10, width: 30, height: 30, r: 15, isEnd: true }
  ],
  links: [
    { id: 'Start00001', taskId: 'Task00001', source: "Start", target: "Microsoft", type: "suit" },
    { id: 'Start00002', taskId: 'Task00001', source: "Start", target: "Huawei", type: "suit" },
    { id: 'Flow00001', className: 'original', taskId: 'Task00001', source: "Microsoft", target: "Samsung", type: "licensing" },
    { id: 'Flow00002', className: 'original', taskId: 'Task00001', source: "Samsung", target: "Motorola", type: "resolved" },
    { id: 'Flow00003', className: 'original', taskId: 'Task00001', source: "Motorola", target: "Amazon", type: "resolved" },
    { id: 'Flow00004', className: 'original', taskId: 'Task00001', source: "Amazon", target: "HTC", type: "suit" },
    { id: 'Flow00005', className: 'original', taskId: 'Task00001', source: "HTC", target: "Apple", type: "suit" },
    { id: 'Flow00006', className: 'original', taskId: 'Task00001', source: "Motorola", target: "HTC", type: "resolved" },
    { id: 'Flow00007', className: 'original', taskId: 'Task00001', source: "Amazon", target: "Apple", type: "licensing" },
    { id: 'Flow00008', className: 'original', taskId: 'Task00001', source: "Huawei", target: "HTC", type: "licensing" },
    { id: 'End00001', taskId: 'Task00001', source: "Apple", target: "End", type: "licensing" }
  ]
};

function App() {
  const [csv, setCsv] = useState(preCsv);
  const [data, setData] = useState(preData);
  let animatedPath = [];
  let isPause = true;
  let isStart = true;
  let begin = 0.1;
  let startTime = '';
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  const calcConnectPoint = d => {
    const { source, target } = d;
    const isEndpoint = d.__proto__.target === 'End';
    let point = {
      source: {},
      target: {},
      type: 'L',
      sweep: 1
    };

    if ((Math.abs(source.x - target.x) >= 2.5 * Math.max(source.width, target.width)) || (Math.abs(source.y - target.y) >= 5 * Math.max(source.height, target.height))) {
      point.type = 'A'
    }
    //calculate relative position
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
        // target's on the left
        if (distance > 0) {
          point.source = {
            x: source.x + (source.width / 2),
            y: source.y + source.height
          };
          if (!isEndpoint) {
            point.target = {
              x: target.x + target.width,
              y: target.y
            };
          }

        } else if (distance < 0) { // target's on the right
          point.source = {
            x: source.x + (source.width / 2),
            y: source.y + source.height
          };
          if (!isEndpoint) {
            point.target = {
              x: target.x,
              y: target.y
            };
          }
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
        if (distance > 0) { // target's on the left
          point.sweep = 0;
          point.source = {
            x: source.x + (source.width / 2),
            y: source.y
          };
          point.target = {
            x: target.x + target.width,
            y: !isEndpoint ? target.y + target.height : target.y + target.height / 2
          };
        } else if (distance < 0) {
          point.sweep = 1;
          point.source = {
            x: source.x + (source.width / 2),
            y: source.y
          };
          point.target = {
            x: target.x,
            y: !isEndpoint ? target.y + target.height : target.y + target.height / 2
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

  const calcDate = dur => {
    //const sTime = new Date(start).getTime();
    //const eTime = new Date(end).getTime();
    return dur / 1000 / 60 / 60 / 60
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
    const isStart = data.nodes.find(item => item.id === d.__proto__.source).isStart;
    const isEnd = data.nodes.find(item => item.id === d.__proto__.target).isEnd;
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

  const handleNodeClick = (d, activity) => {
    activity
      .select(`.${d.id}`)
      .attr("stroke", "#4285F4");
    console.log('handleNodeClick', d)
  };

  const handlePathClick = (d, link) => {
    link.select(`#${d.id}`).attr("stroke", `#4285F4`);
    console.log('handlePathClick')
  };

  const handleCaseClick = (item, circle) => {
    circle.attr('fill', '#FF0000');
  };

  const processAnimation = svg => {
    svg.node().pauseAnimations();
    const timeAccumulator = d => {
      let dur;
      if (d.source === 'Start' || d.target === 'End') {
        dur = 0.1
      } else {
        dur = calcDate(d.pathDur) < 1 ? 1 : calcDate(d.pathDur);
      }
      begin = begin + dur + calcDate(d.activityDur);
      return dur
    };

    const handleBegin = path => {
      animatedPath.push(path.id);
    };

    const handleEnd = path => {
      const index = findIndex(animatedPath, item => item === path.id);
      //animatedPath[index].remove();
    };

    if (!isEmpty(csv)) {
      startTime = csv[0].paths[0]?.startTime;
      csv.forEach((item, csvIndex) => {
        const { id, paths } = item;
        const circle = svg.append('circle')
          .attr('id', id)
          .attr('r', 3)
          .attr("fill", "#fff")
          .style('display', 'none')
          .on('click', () => handleCaseClick(item, circle));

        if (!isEmpty(paths)) {
          if (csvIndex > 0) {
            const sTime = new Date(startTime).getTime();
            const eTime = new Date(paths[0].startTime).getTime();
            begin = calcDate(eTime - sTime)
          }
          paths.forEach((path, index) => {
            const animateMotion = circle.append('animateMotion')
              .attr('begin', `${begin}s`);
            const link = svg.selectAll(`#${path.href}`);
            const g = d3.select(link.node().parentNode);
            const linkLength = link.node().getTotalLength();
            const linkPath = link.node().getAttribute('d');
            const animatePath = g.append('path')
              .attr('stroke', '#FF0000')
              .attr('stroke-width', 1.5)
              .attr('fill', 'none')
              .attr('d', linkPath)
              .attr('stroke-dashoffset', linkLength)
              .attr('stroke-dasharray', `${linkLength}, ${linkLength}`);
            const offset = animatePath.append('animate')
              .attr('attributeName', 'stroke-dashoffset')
              .attr('id', d => `${d.id}animate`)
              .attr('begin', `${begin}s`)
              .attr('values', `${linkLength}; 0`);
            link.append('animate')
              .attr('attributeName', 'stroke')
              .attr('begin', d => `${d.id}animate.end`)
              .attr('dur', `2s`)
              .attr('values', '#FF0000; #FF0000')
              .on('beginEvent', (e, d) => handleBegin(d))
              .on('endEvent', (e, d) => handleEnd(d));

            link.append('animate')
              .attr('attributeName', 'marker-end')
              .attr('begin', d => `${d.id}animate.end`)
              .attr('dur', `2s`)
              .attr('values', 'url(#start); url(#start)');

            const dur = timeAccumulator(path);
            offset.attr('dur', `${dur}s`);
            animateMotion.attr('dur', `${dur}s`);
            animateMotion.append('mpath')
              .attr('xlink:href', `#${path.href}`);
            if (index === 0) {
              animateMotion.on('beginEvent', () => {
                svg.selectAll(`#${id}`)
                  .style('display', 'block')
                  .attr("stroke", "red")
                  .attr("stroke-width", 1);
              })
            }
            if (index + 1 === paths.length) {
              animateMotion.on('endEvent', () => {
                svg.selectAll(`#${id}`)
                  .style('display', 'none');
                if (path.isEnd) {
                  isStart = false;
                  begin = 0;
                }
              })
            }
          })
        }
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
      .attr('fill', '#bfbfbf')
      .attr("d", "M0,-5L10,0L0,5");

    svg.append("svg:defs").selectAll("marker")
      .data(["start"])
      .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 9)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("svg:path")
      .attr('fill', '#ff0000')
      .attr("d", "M0,-5L10,0L0,5");

    const link = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(links)
      .join("g")
      .attr('class', d => `${d.className || ''}`);

    const path = link.append("path")
      .attr('id', d => d.id)
      .attr("fill", "none")
      .attr("stroke", `#bfbfbf`)
      .attr("stroke-width", getStrokeWidth)
      .attr("stroke-dasharray", getStrokeDash)
      .attr("marker-end", "url(#end)")
      .attr("d", linkArc)
      .on('click', (e, d) => handlePathClick(d, link));

    let linkLabelPoint = [];
    path._groups && path._groups[0].map((item, index) => {
      const pathLen = item.getTotalLength();
      const point = item.getPointAtLength(pathLen / 2);
      linkLabelPoint.push(point);
      links[index].linkLabelPoint = point
    });

    svg.selectAll('.original')
      .append('rect')
      .attr('x', d => d.linkLabelPoint.x - 20)
      .attr('y', d => d.linkLabelPoint.y - 10)
      .attr('width', 40)
      .attr('height', 20)
      .attr("fill-opacity", 0.8)
      .attr('fill', '#fff');

    svg.selectAll('.original')
      .append("text")
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

    svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr('class', d => d.className)
      .on('click', (e, d) => {
        if (d.id === 'Start') {
          if (isStart) {
            if (!isPause) {
              svg.node().pauseAnimations();
            } else {
              svg.node().unpauseAnimations();
            }
            isPause = !isPause;
          } else {
            svg.node().setCurrentTime(0);
            isStart = true;
          }
        }
      });


    svg.selectAll('.start')
      .append('circle')
      .attr('cx', d => d.x + d.r)
      .attr('cy', d => d.y + d.r)
      .attr('fill', '#32B16C')
      .attr('r', d => d.r)
      .attr("stroke", "#D6EFE2")
      .attr("stroke-width", 5);

    svg.selectAll('.end')
      .append('circle')
      .attr('cx', d => d.__proto__.x + d.r)
      .attr('cy', d => d.__proto__.y + d.r)
      .attr('fill', '#EB6100')
      .attr('r', d => d.r)
      .attr("stroke", "#eb610033")
      .attr("stroke-width", 10);

    const activity = svg.selectAll('.node')
      .style('user-select', 'none')
      .on('click', (e, d) => handleNodeClick(d, activity));

    activity.append('rect')
      .attr('class', d => d.id)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr('fill', '#fff');

    activity.append('rect')
      .attr('x', d => d.x + 7.5)
      .attr('y', d => d.y + 7.5)
      .attr('width', 20)
      .attr('height', 20)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr("stroke", "black")
      .attr("stroke-width", 0.1)
      .attr('fill', '#FFB238');

    activity.append("text")
      .attr("x", d => d.x + 32)
      .attr("y", d => d.y + 16)
      .text(d => d.id)
      .clone(true).lower()
      .attr('font-size', "12px")
      .attr('font-weight', "bold")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    activity.append("text")
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

    activity.append("text")
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
    processAnimation(svg);
    return svg
  };

  useEffect(() => {
    const temp = document.getElementsByClassName('App')[0];
    temp.append(draw().node())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="App" />
  );
}

export default App;
