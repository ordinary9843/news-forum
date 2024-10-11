export const state = () => ({
  token: '',
  selectLanguage: 'zh',
  isLoading: false,
  loadingText: '',
  windowWidth: 0,
  newsList: [],
  categoryOptions: [],
})

export const getters = {

}

export const actions = {
  // 取得新聞類別
  async getCategories({ state, commit, dispatch, rootState }, data) {
    const result = {
      status: '',
      message: ''
    }
    const config = {
      headers: {
        Authorization: state.token
      }
    }
    try {
      // TODO: update API
      const apiData = await this.$axios
        .$get(`/categories.json`, config)
        .then((response) => {
          return response
        })
      result.status = 'success'
      const setIndexData = {
        key: 'categoryOptions',
        val: apiData
      }
      commit('SET_INDEX', setIndexData)
    } catch (error) {
      result.status = 'error'
      result.message = error.response?.data.message || error.message || ''
    }
    return result
  },
  // 取得新聞資料
  async getNews({ state, commit, dispatch, rootState }, data) {
    const result = {
      status: '',
      message: ''
    }
    const config = {
      headers: {
        Authorization: state.token
      }
    }
    try {
      // TODO: update API
      const apiData = await this.$axios
        .$get(`/newsList.json`, config)
        .then((response) => {
          return response
        })
      result.status = 'success'
      const setIndexData = {
        key: 'newsList',
        val: apiData
      }
      commit('SET_INDEX', setIndexData)
    } catch (error) {
      result.status = 'error'
      result.message = error.response?.data.message || error.message || ''
    }
    return result
  },
  // 評斷新聞公正性 async
  updateNewsImpartiality({ state, commit, dispatch, rootState }, data) {
    const result = {
      status: '',
      message: ''
    }
    // const config = {
    //   headers: {
    //     Authorization: state.token
    //   }
    // }
    try {
      // TODO: update API
      // const apiData = await this.$axios
      //   .$post(`/newsList.json`, data.data, config)
      //   .then((response) => {
      //     return response
      //   })
      result.status = 'success'
      // TODO: 要把新聞公正性的各項百分比寫入新聞資料中
      const payload = {
        index: data.newsIndex,
        key: 'impartiality',
        val: {
          completelyImpartial: 70,
          somewhatBiased: 10,
          veryBiased: 13,
          unableToJudge: 7
        }
      }
      commit('UPDATE_NEWS_LIST_DATA', payload)
    } catch (error) {
      result.status = 'error'
      result.message = error.response?.data.message || error.message || ''
    }
    return result
  }
}

export const mutations = {
  SET_INDEX(state, { key, val }) {
    state[key] = val
  },
  UPDATE_NEWS_LIST_DATA(state, { index, key, val }) {
    state.newsList[index][key] = val
  }
}
