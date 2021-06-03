import React, { useState, useEffect, useRef } from "react";
import { Slider, Row, Col, Card } from "antd";
import { Icon } from "@ant-design/compatible";
import ReactEcharts from "echarts-for-react";
import echarts from "echarts";

import "./SliderChart.css";

const preOption = {
  grid: {
    left: "0%",
    right: "0%",
    bottom: "0%",
    height: "100%",
    width: "100%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: [
      "点",
      "击",
      "柱",
      "子",
      "或",
      "者",
      "两",
      "指",
      "在",
      "触",
      "屏",
      "上",
      "滑",
      "动",
      "能",
      "够",
      "自",
      "动",
      "缩",
      "放",
    ],
    axisLabel: {
      show: false,
      // inside: true,
      textStyle: {
        color: "#fff",
      },
    },
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    z: 10,
  },
  yAxis: {
    splitLine: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: false,
    },
  },
  series: [
    {
      data: [
        220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122,
        133, 334, 198, 123, 125, 220,
      ],
      type: "bar",
      animation: false,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#83bff6" },
          { offset: 0.5, color: "#188df0" },
          { offset: 1, color: "#188df0" },
        ]),
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#2378f7" },
            { offset: 0.7, color: "#2378f7" },
            { offset: 1, color: "#83bff6" },
          ]),
        },
      },
    },
  ],
};

let SliderChart = props => {
  const { csv, playAnimation, isPause, changePause, setCurrentTime } = props;
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [maxValue, setMaxValue] = useState(0);
  const [timeValue, setTimeValue] = useState(0);
  const [option, setOption] = useState(preOption);
  const minValue = 0;
  //创建一个标识，通用容器
  let timer = useRef(null);

  // 首次加载的时候运行一次,相当于componentDidMount
  useEffect(() => {
    const times = getTimes();
    const { sTime, eTime } = times;
    setStart(sTime);
    setEnd(eTime);
    setMaxValue(eTime.getTime() - sTime.getTime());
    const reactEcharts = echarts.init(document.getElementsByClassName("echartsIns")[0]);
    if (option) {
      const picBase64 = reactEcharts.getDataURL({
        pixelRatio: 2,
        backgroundColor: "#E2ECFB",
      });
      document.getElementById("img").setAttribute("src", picBase64);
    }
  }, []);

  const dateFormat = date => {
    return `${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };

  const getTimes = () => {
    let sTime = null;
    let eTime = null;
    csv &&
      csv.map(item => {
        item.paths &&
          item.paths.map(path => {
            const startTime = new Date(path.startTime);
            const endTime = new Date(path.endTime);
            if (!sTime || (sTime && sTime.getTime() >= startTime.getTime())) {
              sTime = startTime;
            }
            if (!eTime || (eTime && eTime.getTime() <= endTime.getTime())) {
              eTime = endTime;
            }
          });
      });
    return { sTime: sTime, eTime: eTime };
  };

  const formatter = (value) => {
    const date = start ? new Date(start.getTime() + value) : null;
    const res = start ? dateFormat(date) : null;
    return res;
  };

  const onChange = value => {
    if (isNaN(value)) {
      return;
    }
    setTimeValue(value);
  };

  const handlePlay = () => {
    let time = timeValue;
    // 清楚定时器
    clearInterval(timer.current);
    playAnimation();
    changePause();
    if (isPause) {
      if (start.getTime() + time < end.getTime()) {
        timer.current = setInterval(() => {
          // 设置定时器，每1000毫秒执行一次，每1000毫秒滑块长度增加进度条的1%长度
          time = time + maxValue / 500;
          const process = new Date(start.getTime() + time);
          if (process.getTime() >= end.getTime()) {
            clearInterval(timer.current);
            changePause();
            setTimeValue(maxValue);
          } else {
            setTimeValue(time);
          }
        }, 20);
      }
    }
  };

  return (
    <div>
      <Row className="chartStyle">
        <ReactEcharts
          className="echartsIns"
          style={{ height: 20, width: 845, display: "none" }}
          option={option}
        />
      </Row>
      <Row className="silderStyle">
        <Col span={1}>
          <Icon
            className="playIconStyle"
            type={!isPause ? "pause" : "caret-right"}
            onClick={() => handlePlay()}
          />
        </Col>
        <Col span={18}>
          <div style={{ width: 845, position: "absolute" }}>
            <span id="silderSpanL" className="silderSpanStyle">
              {start ? dateFormat(start) : null}
            </span>
            <Slider
              tipFormatter={formatter}
              min={minValue}
              max={maxValue}
              onChange={onChange}
              onAfterChange={(value) => {setCurrentTime(value)}}
              value={typeof timeValue === "number" ? timeValue : 0}
              step={0.01}
            />
            <img
              id="img"
              style={{ width: 845, height: 20, position: "absolute", top: 0 }}
            />
            <span id="silderSpanR" className="silderSpanStyle">
              {end ? dateFormat(end) : null}
            </span>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SliderChart;
