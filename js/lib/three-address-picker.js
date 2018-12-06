
(function (win, doc) {
    var win = win
    var doc = doc
    //简单封装通过id获取dom元素
    function $id(id) {
      return doc.getElementById(id)
    }
    //简单封装通过class获取dom元素
    function $class(name) {
      return doc.getElementsByClassName(name)
    }
    //对循环函数做一个简单的封装
    function loop(start, end, func) {
      for(var i = start; i < end; i++) {
        if(func(i)) break;   //如果函数有返回值,则退出循环
      }
  
    }
    //初始化相关参数配置
    function PickerSelector(config) {
      this.type = config.type || 0
      this.container = config.container
      this.dateBtn = config.dateBtn

      this.pickerData = config.pickerData
      this.success = config.success || function () {}
  
      this.ulCount = 3
  
      this.start = {
        Y: 0,
        time: ''
      }
      this.end = {
        Y: 0,
        index: 0
      }
      this.move = {
        Y:0,
        speed: []
      }
      this.firstArray = []
      this.secondArray = []
      this.secondArrayCopy = []
      this.thirdArray = []

      this.position = [0, 0, 0]
      this.distance=0
      this.lineHeight = 40
      this.maxHeight = [0, 0, 0]
      this.index = 0
      this.result = []
      this.initDomUl()
      this.initDomLi()
      this.initEventsBind()
    
      
    }
    PickerSelector.prototype = {
      constructor: PickerSelector,
      //根据param参数动态产生对应的ul元素
      initDomUl: function () {
          
        var html = ''
        var initDom = ''
        var _this = this
        loop(0, _this.pickerData.length, function (i) {
            _this.firstArray.push(_this.pickerData[i].name)
            _this.secondArray.push(_this.pickerData[i].city)
            loop(0, _this.pickerData[i].city.length, function (j) {
                _this.thirdArray.push(_this.pickerData[i].city[j].area)
               
            })
        })
        initDom += '<div class="datetime-picker-box" id="datetime-picker-box-'+ _this.container + '">\n' +
          '    <div class="datetime-picker-container" id="datetime-picker-container-'+ _this.container + '">\n' +
          '        <div class="datetime-picker-content" id="datetime-picker-content-'+ _this.container +'">\n' +
          '           <div class="datetime-selected-line"></div>\n' +
          '           <div class="datetime-select-shadow-top"></div>\n' +
          '           <div class="datetime-select-shadow-bottom"></div>\n' +
          '        </div>\n' +
          '        <div class="datetime-picker-top">\n' +
          '            <div class="datetime-select-btn" id="datetime-select-cancel-'+ _this.container + '">取消</div>\n' +
          '            <div class="datetime-select-btn datetime-select-ok" id="datetime-select-ok-'+ _this.container + '">确定</div>\n' +
          '        </div>\n' +
          '</div>\n' +
          '</div>'
        $class(_this.container)[0].innerHTML += initDom
        loop(0, _this.ulCount, function (i) {
            html += '<div class="datetime-select-box datetime-select-box-left" id="datetime-select-box-' + _this.container + i + '">\n' +
            '    <ul class="datetime-select-container" id="datetime-select-container-' + _this.container + i + '">\n' +
            '    </ul>\n' +
            '</div>'
        })
        $id('datetime-picker-content-'+ _this.container).innerHTML += html
        loop(0, _this.ulCount, function (k) {
          $id('datetime-select-box-' + _this.container + k).style.width = (100 / _this.ulCount).toFixed(2) + '%'  
        })
      },
      //触摸开始的回调函数
      initDomLi: function () {
        var _this = this
        var min=0
        var max = 0
        var dataArray = []
        loop(0, _this.ulCount, function (i) {
          let idx = i
          var tempDomUl = $id('datetime-select-container-' + _this.container + i)
          switch(i) {
            case 0:
              max = _this.firstArray.length
              dataArray = _this.firstArray
              _this.initLists(tempDomUl, min, max,dataArray, 0)
              break
            case 1:
              max = _this.secondArray[0].length
              loop(0,max,function (k) {
                dataArray.push(_this.secondArray[0][k].name)
              })
              _this.initLists(tempDomUl, min, max,dataArray, 1)
              break
            case 2:
              max = _this.secondArray[0][0].area.length
              dataArray =  _this.secondArray[0][0].area
              _this.initLists(tempDomUl, min, max,dataArray, 2)
              break
          }
          
          tempDomUl.style.transform = 'translate3d(0, -'+ _this.position[i] + 'px, 0)'
          tempDomUl.style.webkitTransform = 'translate3d(0, -'+ _this.position[i] + 'px, 0)'
          tempDomUl.addEventListener('touchstart', function () {
            _this.touch(event,_this, tempDomUl, idx)
          }, false)
          tempDomUl.addEventListener('touchend', function () {
            _this.touch(event,_this, tempDomUl, idx)
          }, false)
          tempDomUl.addEventListener('touchmove', function () {
            _this.touch(event,_this, tempDomUl, idx)
          }, false)
          tempDomUl.addEventListener('touchcancel', function () {
            _this.touch(event,_this, tempDomUl, idx)
          }, false)
        })
      },
      initLists: function (tempDomUl, min, max, dataArray, idx) {
        var html = ''
        var _this = this
        html ='<li></li><li></li>'
        loop(min, max, function(i) {
          html += '<li>'+ dataArray[i] + '</li>'
        })
        html += '<li></li><li></li>'
        tempDomUl.innerHTML = html
        _this.maxHeight[idx] = (max - 1) * _this.lineHeight
        _this.position[idx] = 0
        tempDomUl.style.transform = 'translate3d(0, 0, 0)'
        tempDomUl.style.webkitTransform = 'translate3d(0, 0, 0)'
      },
      initEventsBind: function () {
        var _this = this
        //时间选择输入框
        var selectInput = $class(_this.dateBtn)[0]
        selectInput.addEventListener('touchstart', function () {
          $id('datetime-picker-box-' + _this.container ).classList.add('active')
          $id('datetime-picker-container-' + _this.container ).classList.add('datetime-picker-container-up')
        }, false)
        //确定按钮
        var sureBtn = $id('datetime-select-ok-' + _this.container )
        sureBtn.addEventListener('touchstart', function () {
          _this.result = []
          loop(0, _this.ulCount, function (k) {
            _this.index = _this.position[k] / _this.lineHeight
            if(selectInput.value == '' || selectInput.value) { 
              selectInput.value = ''
              switch(k) {
                case 0:
                  _this.result[_this.result.length] = _this.firstArray[_this.index]
                  selectInput.value = _this.result.join('')
                  break
                case 1:
                  _this.result[_this.result.length] = ' ' + _this.secondArrayCopy[_this.index]
                  selectInput.value = _this.result.join('')
                  break
                case 2:
                  _this.result[_this.result.length] = ' ' + _this.thirdArray[_this.index]
                  selectInput.value = _this.result.join('')
                  break
              }
              _this.success(selectInput.value)
            } else {
              selectInput.innerHTML = ''
              switch(k) {
                case 0:
                  _this.result[_this.result.length] = _this.firstArray[_this.index]
                  selectInput.innerHTML = _this.result.join('')
                  break
                case 1:
                  _this.result[_this.result.length] = ' ' + _this.secondArrayCopy[_this.index]
                  selectInput.innerHTML = _this.result.join('')
                  break
                case 2:
                  _this.result[_this.result.length] = ' ' + _this.thirdArray[_this.index]
                  selectInput.innerHTML = _this.result.join('')
                  break
              }
              _this.success(selectInput.innerHTML)
            }
          })
          $id('datetime-picker-box-' + _this.container).classList.remove('active')
          $id('datetime-picker-container-' + _this.container).classList.remove('datetime-picker-container-up')
        }, false)
        //取消按钮
        var cancleBtn = $id('datetime-select-cancel-' + _this.container)
        cancleBtn.addEventListener('touchstart', function () {
          $id('datetime-picker-box-' + _this.container).classList.remove('active')
          $id('datetime-picker-container-' + _this.container).classList.remove('datetime-picker-container-up')
        }, false) 
  
      },
      touch: function (event, that, domUl, idx) {
        event = event || window.event
        event.preventDefault()
        switch(event.type) {
          case "touchstart":
            that.start.Y = event.touches[0].clientY
            that.start.time = Date.now()
            break
          case "touchend":
            that.end.Y = event.changedTouches[0].clientY
            that.distance = that.end.Y - that.start.Y
            var moveLength = Math.abs(that.distance % that.lineHeight)
            var moveDistance
            if(moveLength >= 2 * that.lineHeight) {
              moveDistance = 5 * that.lineHeight
            }else if( moveLength >= that.lineHeight / 2 && moveLength < 2 * that.lineHeight) {
              moveDistance = Math.ceil(Math.abs(that.distance) / that.lineHeight) < 1 ? 1 : Math.ceil(Math.abs(that.distance) / that.lineHeight) - 1
            } else {
              moveDistance = Math.floor(Math.abs(that.distance) / that.lineHeight) < 1 ? 1 : Math.floor(Math.abs(that.distance) / that.lineHeight) - 1
            }
            if(that.distance < 0) {
              that.position[idx] = (that.position[idx] + moveDistance * that.lineHeight) >= that.maxHeight[idx] ? that.maxHeight[idx] : that.position[idx] + moveDistance * that.lineHeight
            } else {
              that.position[idx] = (that.position[idx] - moveDistance * that.lineHeight) <= 0 ? 0 : that.position[idx] - moveDistance * that.lineHeight
            }
            if(idx == 0) {
                that.index = that.position[idx] / that.lineHeight
                that.secondArrayCopy = []
                for(let i = 0; i < that.secondArray[that.index].length; i++) {
                  that.secondArrayCopy.push(that.secondArray[that.index][i].name) 
                }
                that.thirdArray = that.secondArray[that.index][0].area
                that.initLists($id('datetime-select-container-'+ that.container +'1'), 0, that.secondArrayCopy.length, that.secondArrayCopy, 1)
                that.initLists($id('datetime-select-container-'+ that.container +'2'), 0, that.thirdArray.length, that.thirdArray, 2)
                
              } else if(idx == 1) {
                var firsIndex = that.position[0] / that.lineHeight
                that.index = that.position[idx] / that.lineHeight
                that.thirdArray = that.secondArray[firsIndex][that.index].area
                that.initLists($id('datetime-select-container-'+ that.container +'2'), 0, that.thirdArray.length, that.thirdArray, 2)
            }
            domUl.style.transform = 'translate3d(0, -'+ that.position[idx] + 'px, 0)'
            domUl.style.webkitTransform = 'translate3d(0, -'+ that.position[idx] + 'px, 0)'
            domUl.style.transition = 'transform 0.2s ease-out'
            domUl.style.webkitTransition = '-webkit-transform 0.2s ease-out'
            break
          case "touchmove":
            that.move.Y = event.changedTouches[0].clientY
            var offset = that.move.Y - that.start.Y
            var moveDistance = that.position[idx]
            if(offset < 0) {
              moveDistance = that.position[idx] - offset
            } else {
              moveDistance = that.position[idx] - offset
            }
            domUl.style.transform = 'translate3d(0, '+ (-moveDistance) + 'px, 0)'
            domUl.style.webkitTransform = 'translate3d(0, '+ (-moveDistance) + 'px, 0)'
            domUl.style.transition = 'transform 0.2s ease'
            domUl.style.webkitTransition = '-webkit-transform 0.2s ease'
            break
          case "touchcancel":
            if(that.position[idx] >= that.maxHeight[idx]) {
              that.position[idx] = that.maxHeight[idx]
            } else if(that.position[idx] <= 0) {
              that.position[idx] = 0
            }
            domUl.style.transform = 'translate3d(0, -'+ that.position[idx] + 'px, 0)'
            domUl.style.webkitTransform = 'translate3d(0, -'+ that.position[idx] + 'px, 0)'
            domUl.style.transition = 'transform 0.2s ease-out'
            domUl.style.webkitTransition = '-webkit-transform 0.2s ease-out'
            break
        }
      }
  
    }
    if(typeof exports == 'object') {
      module.exports = PickerSelector
    } else if(typeof define == 'function' && define.amd) {
      define([],function () {
        return PickerSelector
      })
    } else {
      win.PickerSelector = PickerSelector
    }
  })(window, document)
  