<!-- 轮播图组件 -->
<script setup lang="ts">
import type { BannerItem } from '@/types/home'
import { ref } from 'vue'
//标识轮播图图片的index
const activeIndex = ref(0)
//轮播图切换时触发----用于绑定轮播图的图片的指示下光标
const onChange: UniHelper.SwiperOnChange = (ev) => {
  // console.log(ev);----ev.detail.current标识图片的下标
  // !  非空断言，排除为空值的情况
  activeIndex.value = ev.detail!.current
}

// 定义props接收----接收首页获取存储轮播图数据的list
defineProps<{ list: BannerItem[] }>()
</script>

<template>
  <view class="carousel">
    <swiper :circular="true" :autoplay="true" :interval="3000" @change="onChange">
      <swiper-item v-for="item in list" :key="item.id">
        <!-- url 属性定义了导航目标的路径 -->
        <navigator url="/pages/index/index" hover-class="none" class="navigator">
          <!-- mode 属性定义了图片的缩放模式，这里设置为 aspectFill -->
          <image mode="aspectFill" class="image" :src="item.imgUrl"></image>
        </navigator>
      </swiper-item>
    </swiper>
    <!-- 轮播图图片指示点 -->
    <view class="indicator">
      <text
        v-for="(item, index) in list"
        :key="item.id"
        class="dot"
        :class="{ active: index === activeIndex }"
      ></text>
    </view>
  </view>
</template>

<style lang="scss">
:host {
  display: block;
  height: 280rpx;
}

/* 轮播图 */
.carousel {
  height: 100%;
  position: relative;
  overflow: hidden;
  transform: translateY(0);
  background-color: #efefef;

  .indicator {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 16rpx;
    display: flex;
    justify-content: center;

    .dot {
      width: 30rpx;
      height: 6rpx;
      margin: 0 8rpx;
      border-radius: 6rpx;
      background-color: rgba(255, 255, 255, 0.4);
    }

    .active {
      background-color: #fff;
    }
  }

  .navigator,
  .image {
    width: 100%;
    height: 100%;
  }
}
</style>
