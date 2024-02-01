import { Callback } from '../../types'
import { Options } from '../../core/index'
import { _global, _support } from '../../utils'
import { Severity } from '../../shared'

/**
 * 白屏监测
 * @param callback
 * @param options
 */
export function openWhiteScreen(callback: Callback, options: Options) {
  const { skeletonProject, whiteBoxElements } = options
  let _whiteLoopNum = 0;
  const _skeletonInitList: any = []; // 存储初次采样点
  let _skeletonNowList: any = []; // 存储当前采样点

  // 项目有骨架屏
  if (skeletonProject) {
    if (document.readyState != 'complete') {
      idleCallback();
    }
  } else {
    // 页面加载完毕
    if (document.readyState === 'complete') {
      idleCallback();
    } else {
      _global.addEventListener('load', idleCallback);
    }
  }

  // 选中dom点的名称
  function getSelector(element: any) {
    if (element.id) {
      return '#' + element.id;
    } else if (element.className) {
      // div home => div.home
      return (
        '.' +
        element.className
          .split(' ')
          .filter((item: any) => !!item)
          .join('.')
      );
    } else {
      return element.nodeName.toLowerCase();
    }
  }
  // 判断采样点是否为容器节点
  function isContainer(element: HTMLElement) {
    const selector = getSelector(element);
    if (skeletonProject) {
      _whiteLoopNum ? _skeletonNowList.push(selector) : _skeletonInitList.push(selector);
    }
    return whiteBoxElements?.indexOf(selector) != -1;
  }
  // 采样对比
  function sampling() {
    let emptyPoints = 0;
    for (let i = 1; i <= 9; i++) {
      const xElements = document.elementsFromPoint(
        (_global.innerWidth * i) / 10,
        _global.innerHeight / 2
      );
      const yElements = document.elementsFromPoint(
        _global.innerWidth / 2,
        (_global.innerHeight * i) / 10
      );
      if (isContainer(xElements[0] as HTMLElement)) emptyPoints++;
      // 中心点只计算一次
      if (i != 5) {
        if (isContainer(yElements[0] as HTMLElement)) emptyPoints++;
      }
    }
    // console.log('_skeletonInitList', _skeletonInitList, _skeletonNowList);

    // 页面正常渲染，停止轮训
    if (emptyPoints != 17) {
      if (skeletonProject) {
        // 第一次不比较
        if (!_whiteLoopNum) return openWhiteLoop();
        // 比较前后dom是否一致
        if (_skeletonNowList.join() == _skeletonInitList.join())
          return callback({
            status: Severity.ERROR,
          });
      }
      if (_support._loopTimer) {
        clearTimeout(_support._loopTimer);
        _support._loopTimer = null;
      }
    } else {
      // 开启轮训
      if (!_support._loopTimer) {
        openWhiteLoop();
      }
    }
    // 17个点都是容器节点算作白屏
    callback({
      status: emptyPoints == 17 ? Severity.ERROR : Severity.INFO,
    });
  }
  // 开启白屏轮训
  function openWhiteLoop(): void {
    if (_support._loopTimer) return;
    _support._loopTimer = setInterval(() => {
      if (skeletonProject) {
        _whiteLoopNum++;
        _skeletonNowList = [];
      }
      idleCallback();
    }, 1000);
  }
  function idleCallback() {
    if ('requestIdleCallback' in _global) {
      requestIdleCallback(deadline => {
        // timeRemaining：表示当前空闲时间的剩余时间
        if (deadline.timeRemaining() > 0) {
          sampling();
        }
      });
    } else {
      sampling();
    }
  }
}
