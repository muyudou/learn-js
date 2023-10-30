module.exports = {
    title: 'Hello VuePress',
    description: 'Just playing around',
    theme: 'reco',
    base: '/learn-js/',
    locales: {
        '/': {
          lang: 'zh-CN'
        }
      },
    themeConfig: {
        subSidebar: 'auto',
        nav: [
            { text: '首页', link: '/' },
            { 
                text: '冴羽的 JavaScript 博客', 
                items: [
                    { text: 'Github', link: 'https://github.com/mqyqingfeng' },
                    { text: '掘金', link: 'https://juejin.cn/user/712139234359182/posts' }
                ]
            }
        ],
        sidebar: [
            {
                title: '欢迎学习',
                path: '/',
                collapsable: false, // 不折叠
                children: [
                    { title: "学前必读", path: "/" }
                ]
            },
            {
              title: "基础学习",
              path: '/handbook/ts',
              collapsable: false, // 不折叠
              children: [
                { title: "第一篇", path: "/handbook/ts" },
                { title: "第二篇", path: "/handbook/js" }
              ],
            }
        ]
    }
}