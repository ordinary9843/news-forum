<template>
  <a-icon :component="LineSvg" />
</template>

<script>
import LineSvg from './LineSvg.vue'
export default {
  name: 'LineIcon',
  data () {
    return {
      LineSvg
    }
  }
}
</script>
<style lang="scss" scoped></style>
