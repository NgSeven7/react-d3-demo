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
  const { csv, playAnimation, isPause, changePause, setCurrentTime, sTime, eTime, animateDur } = props;
  const [timeValue, setTimeValue] = useState(0);
  const [option, setOption] = useState(preOption);
  const minValue = 0;
  //创建一个标识，通用容器
  let timer = useRef(null)

  // 首次加载的时候运行一次,相当于componentDidMount
  useEffect(() => {
    const reactEcharts = echarts.init(document.getElementsByClassName("echartsIns")[0]);
    if (option) {
      const picBase64 = reactEcharts.getDataURL({
        pixelRatio: 2,
        backgroundColor: "#E2ECFB",
      });
      document.getElementById("img").setAttribute("src", picBase64);
    }
  }, []);

  const timeFormat = date => {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };

  
  const dateFormat = date => {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatter = (value) => {
    const date = sTime ? new Date(sTime.getTime() + value) : null;
    const res = sTime ? timeFormat(date) : null;
    return res;
  };

  const onChange = value => {
    if (isNaN(value)) {
      return;
    }
    setTimeValue(value);
    setCurrentTime(value)
  };

  const handlePlay = () => {
    let time = timeValue;
    // 清楚定时器
    clearInterval(timer.current);
    playAnimation();
    changePause('start');
    if (isPause) {
      if (sTime.getTime() + time < eTime.getTime()) {
        timer.current = setInterval(() => {
          // 设置定时器，每20毫秒执行一次，每20毫秒滑块时间值增加20/1000
          time = time + 20 / 1000;
          if (time >= animateDur) {
            console.log('end')
            changePause('end');
            setCurrentTime(0);
            clearInterval(timer.current);
            setTimeValue(0);
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
      <Row className="sliderStyle">
        <Col span={1}>
          <Icon
            className="playIconStyle"
            type={!isPause ? "pause" : "caret-right"}
            onClick={() => handlePlay()}
          />
        </Col>
        <Col span={18}>
          <div style={{ width: 845, position: "absolute" }}>
            <span id="sliderSpanL" className="sliderSpanStyle">
              {sTime ? dateFormat(sTime) : null}
            </span>
            <Slider
              tipFormatter={formatter}
              min={minValue}
              max={animateDur}
              onChange={onChange}
              onAfterChange={(value) => {changePause('end')}}
              value={typeof timeValue === "number" ? timeValue : 0}
              step={0.01}
            />

            
            <img
              id="img"
              style={{ width: 845, height: 20, position: "absolute", top: 0 }}
            />
            <span id="sliderSpanR" className="sliderSpanStyle">
              {eTime ? dateFormat(eTime) : null}
            </span>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SliderChart;
