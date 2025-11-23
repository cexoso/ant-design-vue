<template>
  <div id="right-bottom">
    <a v-if="isAdVisible" :href="'https://mentorbook.ai'" target="_blank">
      <img
        :src="isCN ? mentorbook_banner_zh : mentorbook_banner_en"
        style="width: 152px; display: block; margin-top: 16px"
      />
    </a>
  </div>
</template>

<script>
import moment from 'moment';
import mentorbook_banner_en from '../../assets/MPU_176x250_bf_en.svg';
import mentorbook_banner_zh from '../../assets/MPU_176x250_bf_zh.svg';
const isEffective = (start, end) => {
  return moment().isBetween(start, end);
};
export default {
  components: {},
  props: ['isCN', 'isMobile'],
  data() {
    return {
      isEffective,
      mentorbook_banner_en,
      mentorbook_banner_zh,
      isAdVisible: isEffective('2025-11-24 00:00:00', '2025-11-30 23:59:59'),
    };
  },
};
</script>

<style lang="less" scoped>
#right-bottom {
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 152px;
  overflow: hidden;
  .close {
    position: absolute;
    text-align: center;
    top: -8px;
    right: -8px;
    font-size: 16px;
    padding: 15px;
    color: #6e3041;
  }
}
</style>
