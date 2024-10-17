export const state = () => ({
  token: '',
  selectLanguage: 'zh',
  isLoading: false,
  loadingText: '',
  windowWidth: 0,
  categoryOptions: [],
  activeCategory: '',
  newsList: [],
  gettingNews: false,
  newsNextToken: '',
  newsHasItems: true,
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
      const apiData = await this.$axios
        .$get(`/api/news-category`, config)
        .then((response) => {
          return response
        })
      if (apiData.success) {
        result.status = 'success'
        const categoryOptions = apiData.result.categories.map(item => {
          return {
            label: item.label,
            value: item.key
          }
        })
        const setIndexData = {
          key: 'categoryOptions',
          val: categoryOptions
        }
        commit('SET_INDEX', setIndexData)
      } else {
        result.status = 'error'
        result.message = apiData.message || ''
      }
    } catch (error) {
      result.status = 'error'
      result.message = error.response?.data.message || error.message || ''
    }
    return result
  },
  // 取得新聞資料
  async getNews({ state, commit, dispatch, rootState }, data) {
    commit('SET_INDEX', {
      key: 'gettingNews',
      val: true
    })
    const result = {
      status: '',
      message: '',
    }
    const config = {
      headers: {
        Authorization: state.token
      }
    }
    try {
      const apiData = await this.$axios
        .$get(`/api/news?limit=10${data.reset ? '&reset=true' : ''}&category=${data.category}${data.nextToken ? '&nextToken=' + data.nextToken : ''}`, config)
        .then((response) => {
          return response
        })
      if (apiData.success) {
        result.status = 'success'
        commit('SET_INDEX', {
          key: 'newsNextToken',
          val: apiData.result.nextToken
        })
        commit('SET_INDEX', {
          key: 'newsHasItems',
          val: apiData.result.hasItems
        })
        let newsDataList = []
        // 如果是第一頁，直接覆寫資料
        if (!data.nextToken) {
          newsDataList = apiData.result.items
        } else {
          newsDataList = [...state.newsList, ...apiData.result.items]
        }
        const setIndexData = {
          key: 'newsList',
          val: newsDataList
        }
        commit('SET_INDEX', setIndexData)
      } else {
        result.status = 'error'
        result.message = apiData.message || ''
      }
    } catch (error) {
      result.status = 'error'
      result.message = error.response?.data.message || error.message || ''
    }
    commit('SET_INDEX', {
      key: 'gettingNews',
      val: false
    })
    return result
  },
  // 評斷新聞公正性(投票)
  async updateNewsVote({ state, commit, dispatch, rootState }, data) {
    const result = {
      status: '',
      message: '',
      data: null
    }
    try {
      const apiData = await this.$axios
        .$post(`/api/news-vote/${data.newsId}`, data.data)
        .then((response) => {
          return response
        })
      if (apiData.success) {
        result.status = 'success'
        result.data = apiData.result
        // 要把新聞公正性的各項百分比更新回新聞資料中
        const payload = {
          index: data.newsIndex,
          key: 'voteStatistics',
          val: apiData.result
        }
        commit('UPDATE_NEWS_LIST_DATA', payload)
        const votedPayload = {
          index: data.newsIndex,
          votedOption: data.data.bias,
        }
        commit('UPDATE_NEWS_VOTE_STATUS', votedPayload)
      } else {
        result.status = 'error'
        result.message = apiData.message || ''
      }
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
  },
  UPDATE_NEWS_VOTE_STATUS(state, { index, votedOption }) {
    state.newsList[index].isVoted = true
    state.newsList[index].votedOption = votedOption
  }
}
