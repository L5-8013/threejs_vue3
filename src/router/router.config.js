import {
    createRouter,
    createWebHashHistory
} from "vue-router"

import Page1 from '../pages/page1/page1.vue'

const routes = [{
        path: '/',
        name: 'Page1',
        component: Page1
    },
    {
        path: '/page2',
        name: 'Page2',
        component: () => import('../pages/page2/page2.vue')
    },
    {
        path: '/:catchAll(.*)', //如果没有匹配项, 匹配所有路径 vue2 使用 * ；vue3 使用 `/:pathMatch(.*)* ` 或者 `/:pathMatch(.*)` 或者 `/:catchAll(.*)`
        redirect: '/' //重定向到首页(也可以渲染一个404组件)
    }
]

const router = createRouter({
    history: createWebHashHistory(), // 哈希值模式
    routes
})

export default router