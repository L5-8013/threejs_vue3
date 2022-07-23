import { defineStore } from 'pinia'
export const useMainStore =  defineStore('main',{
    // 静态数据
    state:()=>{
        return {
            info:"全局变量info",
            count:1
        }
    },
     // 相当于计算属性(有数据缓存)
    getters: {},
    // actions即可以是同步函数也可以是异步函数
    actions:{
        changeCount() {
            this.count++;
        }
    }
})