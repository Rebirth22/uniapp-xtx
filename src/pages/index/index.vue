<script setup lang="ts">
import XtxSwiper from '@/components/XtxSwiper.vue'
import CustomNavbar from './componets/CustomNavbar.vue'
import CategoryPanel from './componets/CategoryPanel.vue'
import HotPanel from './componets/HotPanel.vue'
import XtxGuess from '@/components/XtxGuess.vue'
import { getHomeBannerAPI, getHomeCategoryAPI, getHomeHotAPI } from '@/services/home'
import type { BannerItem, CategoryItem, HotItem } from '@/types/home'
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 获取轮播图数据
const bannerList = ref<BannerItem[]>([])
const getHomeBannerData = async () => {
  const res = await getHomeBannerAPI()
  bannerList.value = res.result
}
// 获取前台分类数据
const categoryList = ref<CategoryItem[]>([])
const getHomeCategoryData = async () => {
  const res = await getHomeCategoryAPI()
  categoryList.value = res.result
}

// 获取热门推荐数据
const hotList = ref<HotItem[]>([])
const getHomeHotData = async () => {
  const res = await getHomeHotAPI()
  hotList.value = res.result
}
// 页面加载时触发----类似onMounted
onLoad(() => {
  getHomeBannerData(), getHomeCategoryData(), getHomeHotData()
})

// 获取猜你喜欢实例----绑定猜你喜欢组件里面的实例对象
export type XtxGuessInstance = InstanceType<typeof XtxGuess>
const guessRef = ref<XtxGuessInstance>()
// 滚动容器触底的时候触发
const onScrollower = () => {
  guessRef.value?.getMore()
}
</script>

<template>
  <!-- 自定义导航栏 -->
  <CustomNavbar />
  <!-- scroll-view：滚动容器，实现页面滚动
  @scrolltolower：滚动触底的时候触发-->
  <scroll-view scroll-y @scrolltolower="onScrollower">
    <!-- 自定义轮播图 :list="bannerList"绑定传给子组件获取的轮播图数据-->
    <XtxSwiper :list="bannerList" />
    <!-- 分类面板 -->
    <CategoryPanel :list="categoryList" />
    <!-- 热门推荐 -->
    <HotPanel :list="hotList" />
    <!-- 猜你喜欢 -->
    <XtxGuess ref="guessRef" />
  </scroll-view>
</template>

<style lang="scss">
page {
  background-color: #f7f7f7;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scroll-view {
  flex: 1;
}
</style>
