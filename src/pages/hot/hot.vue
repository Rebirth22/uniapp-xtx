<!-- 热门推荐的详细路由 -->
<script setup lang="ts">
import { getHotRecommendAPI } from '@/services/hot'
import type { SubTypeItem } from '@/types/hot'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 热门推荐页 标题和url
const urlMap = [
  { type: '1', title: '特惠推荐', url: '/hot/preference' },
  { type: '2', title: '爆款推荐', url: '/hot/inVogue' },
  { type: '3', title: '一站买全', url: '/hot/oneStop' },
  { type: '4', title: '新鲜好物', url: '/hot/new' },
]

// uniapp 获取页面参数----首页的HotPanel中包含跳转链接，获取其中的参数，参数是接口获取到的数据
const query = defineProps<{
  type: string
}>()

// 匹配设置好的标题
const currUrlMap = urlMap.find((v) => v.type === query.type)
// 动态设置导航栏标题
uni.setNavigationBarTitle({ title: currUrlMap!.title })

// 推荐商品封面图
const bannerPicture = ref('')
// 推荐选项----tab导航选项----追加finish属性标志全部加载商品数据，？标志可有可无，后端并不存在finish属性
const subTypes = ref<(SubTypeItem & { finish?: boolean })[]>([])
// tab栏高亮的下标
const activeIndex = ref(0)

// 获取热门推荐数据
const getHotRecommendData = async () => {
  const res = await getHotRecommendAPI(currUrlMap!.url, {
    // 技巧：环境变量，开发环境，修改初始页面方便测试分页结束
    page: import.meta.env.DEV ? 30 : 1,
    pageSize: 10,
  })
  // console.log(res)
  bannerPicture.value = res.result.bannerPicture //商品封面图片
  subTypes.value = res.result.subTypes //tab导航选项
}

// 页面加载
onLoad(() => {
  getHotRecommendData()
})

// 页面滚动触底
const onScrolltolower = async () => {
  // 获取推荐页面当前的选项的商品数据信息
  const currsubTypes = subTypes.value[activeIndex.value]
  // console.log(currsubTypes)
  // 分页条件
  if (currsubTypes.goodsItems.page < currsubTypes.goodsItems.pages) {
    // 当前页码累加-----商品数据累加
    currsubTypes.goodsItems.page++
  } else {
    // 标记已结束----已全部加载当前tab下所有的商品数据
    currsubTypes.finish = true //currsubTypes中不存在finish属性，需要追加属性，在上面的定义时追加
    // 退出并轻提示
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  // 调用API传参----加载下一页信息
  const res = await getHotRecommendAPI(currUrlMap!.url, {
    subType: currsubTypes.id,
    page: currsubTypes.goodsItems.page,
    pageSize: currsubTypes.goodsItems.pageSize,
  })
  // console.log(res)
  // 最新的商品列表
  const newsubTypes = res.result.subTypes[activeIndex.value]
  // 数组追加----将最新获取的商品数据追加到展示商品的数组中
  currsubTypes.goodsItems.items.push(...newsubTypes.goodsItems.items)
}
</script>

<template>
  <view class="viewport">
    <!-- 推荐封面图 -->
    <view class="cover">
      <image :src="bannerPicture"> </image>
    </view>
    <!-- 推荐选项 -->
    <view class="tabs">
      <!--:class="{ active: index === activeIndex }"：绑定tab栏高亮的部分
      @tap="activeIndex = index"：tab栏选中的对应高亮-->
      <text
        v-for="(item, index) in subTypes"
        :key="item.id"
        class="text"
        :class="{ active: index === activeIndex }"
        @tap="activeIndex = index"
        >{{ item.title }}</text
      >
    </view>
    <!-- tab栏对应的推荐列表 -->
    <!-- v-show="activeIndex === index":选中才显示，v-if会销毁 -->
    <scroll-view
      v-for="(item, index) in subTypes"
      :key="item.id"
      v-show="activeIndex === index"
      scroll-y
      class="scroll-view"
      @scrolltolower="onScrolltolower"
    >
      <view class="goods">
        <navigator
          hover-class="none"
          class="navigator"
          v-for="goods in item.goodsItems.items"
          :key="goods.id"
          :url="`/pages/goods/goods?id=${goods.id}`"
        >
          <image class="thumb" :src="goods.picture"></image>
          <view class="name ellipsis">{{ goods.name }}</view>
          <view class="price">
            <text class="symbol">¥</text>
            <text class="number">{{ goods.price }}</text>
          </view>
        </navigator>
      </view>
      <view class="loading-text"> {{ item.finish ? '没有更多数据了~' : '正在加载...' }}</view>
    </scroll-view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  background-color: #f4f4f4;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 180rpx 0 0;
  position: relative;
}

.cover {
  width: 750rpx;
  height: 225rpx;
  border-radius: 0 0 40rpx 40rpx;
  overflow: hidden;
  position: absolute;
  left: 0;
  top: 0;
}

.scroll-view {
  flex: 1;
}

.tabs {
  display: flex;
  justify-content: space-evenly;
  height: 100rpx;
  line-height: 90rpx;
  margin: 0 20rpx;
  font-size: 28rpx;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 5rpx rgba(200, 200, 200, 0.3);
  color: #333;
  background-color: #fff;
  position: relative;
  z-index: 9;

  .text {
    margin: 0 20rpx;
    position: relative;
  }

  .active {
    &::after {
      content: '';
      width: 40rpx;
      height: 4rpx;
      transform: translate(-50%);
      background-color: #27ba9b;
      position: absolute;
      left: 50%;
      bottom: 24rpx;
    }
  }
}

.goods {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 20rpx 20rpx;

  .navigator {
    width: 345rpx;
    padding: 20rpx;
    margin-top: 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
  }

  .thumb {
    width: 305rpx;
    height: 305rpx;
  }

  .name {
    height: 88rpx;
    font-size: 26rpx;
  }

  .price {
    line-height: 1;
    color: #cf4444;
    font-size: 30rpx;
  }

  .symbol {
    font-size: 70%;
  }

  .decimal {
    font-size: 70%;
  }
}

.loading-text {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  padding: 20rpx 0 50rpx;
}
</style>
