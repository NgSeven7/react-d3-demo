import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Slider, Input, Row, Col, Button, Card } from 'antd';
import { Icon } from '@ant-design/compatible';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';
import './SliderChart.css';
// import styles from './SliderChart.less';

let SliderChart = (props, ref) => {
  const { csv, playAnimation, processAnimation, svgObj, pause } = props
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [processTime, setProcessTime] = useState('');
  const [timeValue, setTimeValue] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speedValue, setSpeedValue] = useState(50);
  const [option, setOption] = useState({});

  //创建一个标识，通用容器
  let timer = useRef(null);

  // 首次加载的时候运行一次,相当于componentDidMount
  useEffect(() => {
    const times = getTimes()
    const { sTime, eTime } = times
    setStart(sTime)
    setEnd(eTime)
    setMaxValue(eTime.getTime() - sTime.getTime())
    setProcessTime(`${sTime.getFullYear()}/${sTime.getMonth() + 1}/${sTime.getDate()} ${sTime.getHours()}:${sTime.getMinutes()}:${sTime.getSeconds()}`)
    const obj = {
      grid: {
        left: '0%',
        right: '0%',
        bottom: '0%',
        height: '100%',
        width: '100%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['点', '击', '柱', '子', '或', '者', '两', '指', '在', '触', '屏', '上', '滑', '动', '能', '够', '自', '动', '缩', '放'],
        axisLabel: {
          show: false,
          // inside: true,
          textStyle: {
            color: '#fff'
          }
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        z: 10
      },
      yAxis: {
        splitLine: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        }
        // axisLabel: {
        //   textStyle: {
        //     color: '#999'
        //   }
        // }
      },
      // dataZoom: [
      //   {
      //     type: 'inside'
      //   }
      // ],
      series: [{
        data: [220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122, 133, 334, 198, 123, 125, 220],
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(
            0, 0, 0, 1,
            [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ]
          )
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ]
            )
          }
        },
      }]
    };
    setOption(obj)
  }, []);

  useImperativeHandle(ref, () => ({
    getTimes: getTimes
  }))

  const getTimes = () => {
    let sTime = null
    let eTime = null
    csv && csv.map(item => {
      item.paths && item.paths.map(path => {
        const startTime = new Date(path.startTime)
        const endTime = new Date(path.endTime)
        if (!sTime || (sTime && sTime.getTime() >= startTime.getTime())) {
          sTime = startTime
        }
        if (!eTime || (eTime && eTime.getTime() <= endTime.getTime())) {
          eTime = endTime
        }
      })
    })
    return { sTime: sTime, eTime: eTime }
  }


  const formatter = value => {
    const date = start ? new Date(start.getTime() + value) : null;
    const res = start ? `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}` : null
    return res
  };

  const onChange = value => {
    const date = new Date(start.getTime() + value);
    if (isNaN(value)) {
      return;
    }
    playAnimation(value / 1000 / 60 / 60 / 60, false)
    setTimeValue(value)
    setProcessTime(`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)
  };

  const handlePlay = () => {
    let time = timeValue
    // 清楚定时器
    clearInterval(timer.current);
    let promise = new Promise((resolve, reject) => {
      const isPlay = !autoPlay
      setAutoPlay(!autoPlay)
      resolve(isPlay);
      pause(isPlay);
    })
    // 渲染完成后执行then()方法的操作代码 
    promise.then((isPlay) => {
      if (isPlay) {
        if (start.getTime() + time < end.getTime()) {
          timer.current = setInterval(() => {
            if (time === 0) {
              processAnimation(svgObj)
            }
            // 设置定时器，每1000毫秒执行一次，每1000毫秒滑块长度增加进度条的1%长度
            time = time + (maxValue / 500)
            const process = new Date(start.getTime() + time)
            if (process.getTime() >= end.getTime()) {
              // playAnimation(maxValue / 1000 / 60 / 60 / 60, false)
              clearInterval(timer.current);
              setAutoPlay(false)
              setTimeValue(maxValue)
              setProcessTime(`${end.getFullYear()}/${end.getMonth() + 1}/${end.getDate()} ${end.getHours()}:${end.getMinutes()}:${end.getSeconds()}`)
            } else {
              // playAnimation(time / 1000 / 60 / 60 / 60, true)
              setTimeValue(time)
              setProcessTime(`${process.getFullYear()}/${process.getMonth() + 1}/${process.getDate()} ${process.getHours()}:${process.getMinutes()}:${process.getSeconds()}`)
            }
          }, 20);
        }
      }
    });


  }

  const click1 = (value: any) => {
    const reactEcharts = echarts.init(document.getElementsByClassName('echartsIns')[0]);
    const picBase64 = reactEcharts.getDataURL({
      pixelRatio: 2,
      backgroundColor: '#E2ECFB'
    });
    document.getElementById('img').setAttribute('src', picBase64);
  }

  const events = {
    'click': click1
  }



  return (
    <div>
      <Row className="chartStyle">
        <Card title="">
          <ReactEcharts
            className="echartsIns"
            style={{ height: 20, width: 845, backgroundColor: '#E2ECFB' }}
            option={option}
            onEvents={events} />
        </Card>
      </Row>
      <Row className="silderStyle">
        <Col span={1}>
          <Icon className="playIconStyle" type={autoPlay ? "pause" : "caret-right"} onClick={() => handlePlay()} />
          {/* //  onClick={() => handlePlay(); playAnimation()} */}
        </Col>
        <Col span={18}>
          <div style={{ width: 845, position: 'absolute' }}>
            <span id="silderSpanL" className="silderSpanStyle">{start ? `${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}` : null}</span>
            <Slider
              tipFormatter={formatter}
              min={minValue}
              max={maxValue}
              onChange={onChange}
              value={typeof timeValue === 'number' ? timeValue : 0}
              step={0.01}
            />
            <img id="img" style={{ width: 845, height: 20, position: 'absolute', top: 0, zIndex: 1 }} />
            <span id="silderSpanR" className="silderSpanStyle">{end ? `${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()}` : null}</span>
          </div>
        </Col>
      </Row>
    </div >
  );
}

SliderChart = forwardRef(SliderChart);
export default SliderChart;