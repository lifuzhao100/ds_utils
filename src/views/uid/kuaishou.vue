<template>
  <div class="uid-kuaishou">
    <section class="box">
      <h2 class="box-title">快手UID</h2>

      <div class="input-box">
        <div class="input-item">
          <input v-model="state.url" id="url" type="text" autocomplete="off" required>
          <label for="url">快手链接</label>
        </div>

        <div class="input-item">
          <input v-model="state.cookie" id="cookie" type="text" autocomplete="off" required>
          <label for="url">Cookie</label>
          <p class="tips">用户主页链接需要传cookie，点击作品进入作品页链接可不传</p>
        </div>

        <div class="result-box">
          <div class="button" @click="handleSubmit">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            提交
          </div>
          <div class="result">{{ state.result }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import axios from 'axios'

const state = reactive({
  url: '',
  cookie: '',
  result: '请先提交',
})

function handleSubmit() {
  const url = state.url.trim()
  const cookie = state.cookie.trim()

  if (!url) {
    state.result = '请先提交'
    return
  }
  state.result = '就快好了...'
  axios.post('/api/uid/kuaishou', {
    url: url,
    cookie: cookie,
  }).then(res => {
    const {data} = res
    if (data.success) {
      state.result = data.data
    } else {
      state.result = data.message || '获取失败了，请尝试输入作品页链接或者传入cookie'
    }
    console.log(res)
  })
}

</script>

<style lang="less">
@mainColor: #03e9f4;

.uid-kuaishou {
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  overflow: auto;
  padding: 75px 0;
}

.box {
  width: 80%;
  height: 40%;
  max-width: 480px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  box-shadow: 0 15px 25px rgb(0 0 0 /60%);
  padding: 36px 48px 24px;

  &-title {
    font-size: 32px;
    font-weight: bolder;
    color: @mainColor;
    letter-spacing: 2px;
    text-align: center;
    padding: 12px 0;
    margin-bottom: 56px;
    text-shadow: 0 0 5px @mainColor, 0 0 25px @mainColor, 0 0 50px @mainColor, 0 0 100px @mainColor;
  }
}

.input-item {
  position: relative;
  padding: 0;

  & + .input-item {
    margin-top: 64px;
  }

  input {
    border-bottom: 1px solid @mainColor;
    background-color: transparent;
    color: #fff;
    outline: none;
    width: 100%;
    line-height: 42px;
    box-sizing: border-box;
    padding: 2px 0;

    &:valid, &:focus {
      & + label {
        //display: block;
        top: -10px;
        color: @mainColor;
      }
    }
  }

  label {
    position: absolute;
    left: 0;
    top: 24px;
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
    transform: translateY(-50%);
    transition: all 0.5s;
  }

  .tips {
    color: #999;
    margin-top: 12px;
    font-size: 13px;
    word-break: break-word;
  }
}

.button {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  font-size: 16px;
  color: @mainColor;
  letter-spacing: 4px;
  //border-radius: 4px;
  cursor: pointer;
  padding: 6px 24px;
  vertical-align: middle;
  box-sizing: content-box;

  &:hover {
    color: #fff;
    border-radius: 4px;
    background-color: @mainColor;
    box-shadow: 0 0 5px @mainColor, 0 0 25px @mainColor, 0 0 50px @mainColor, 0 0 100px @mainColor;

    span {
      animation-play-state: paused;
    }
  }

  span {
    background-color: @mainColor;
    position: absolute;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    //animation-play-state: paused;

    &:nth-of-type(1) {
      top: 0;
      left: -100%;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, @mainColor);
      animation-name: btn-1;
      animation-delay: 0s;
    }

    &:nth-of-type(2) {
      right: 0;
      top: -100%;
      width: 2px;
      height: 100%;
      background: linear-gradient(180deg, transparent, @mainColor);
      animation-name: btn-2;
      animation-delay: .25s;
    }

    &:nth-of-type(3) {
      right: -100%;
      bottom: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(270deg, transparent, @mainColor);
      animation-name: btn-3;
      animation-delay: .5s;
    }

    &:nth-of-type(4) {
      left: 0;
      bottom: -100%;
      width: 2px;
      height: 100%;
      background: linear-gradient(360deg, transparent, @mainColor);
      animation-name: btn-4;
      animation-delay: .75s;
    }
  }

}

.result-box {
  display: flex;
  align-items: flex-start;
  min-height: 60px;
  margin-top: 76px;
}

.result {
  color: @mainColor;
  margin-left: 24px;
}

@keyframes btn-1 {
  0% {
    left: -100%;
  }
  50%, 100% {
    left: 100%;
  }
}

@keyframes btn-2 {
  0% {
    top: -100%;
  }
  50%, 100% {
    top: 100%;
  }
}

@keyframes btn-3 {
  0% {
    right: -100%;
  }
  50%, 100% {
    right: 100%;
  }
}

@keyframes btn-4 {
  0% {
    bottom: -100%;
  }
  50%, 100% {
    bottom: 100%;
  }
}
</style>