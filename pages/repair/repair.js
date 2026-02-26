// pages/repair/repair.js
const app = getApp();
const { repairApi } = require('../../utils/api');
const { FAULT_LEVEL, REPAIR_STATUS } = require('../../utils/constants');

Page({
    data: {
        isLoggedIn: false,
        role: 'USER',
        tabs: [],
        activeTab: '',
        list: [],
        filteredList: [],
        page: 1,
        pageSize: 10,
        hasMore: true
    },

    onShow() {
        const isLoggedIn = app.globalData.isLoggedIn;
        const role = app.globalData.role;

        const tabs = role === 'TECHNICIAN' ? [
            { id: 'PENDING', label: '待处理', count: 0 },
            { id: 'IN_PROGRESS', label: '维修中', count: 0 },
            { id: 'COMPLETED', label: '已完成', count: 0 }
        ] : [
            { id: 'IN_PROGRESS', label: '处理中', count: 0 },
            { id: 'COMPLETED', label: '已完成', count: 0 }
        ];

        const activeTab = this.data.activeTab || tabs[0].id;

        this.setData({ isLoggedIn, role, tabs, activeTab });

        if (isLoggedIn) {
            this.setData({ page: 1, list: [] });
            this.loadData();
        } else {
            this.loadDemoData();
        }
    },

    async loadData() {
        try {
            const params = {
                page: this.data.page,
                pageSize: this.data.pageSize,
                status: this.data.activeTab
            };
            const res = await repairApi.getList(params);
            const list = (res.list || res.records || []).map(item => this.formatItem(item));

            const allList = this.data.page === 1 ? list : [...this.data.list, ...list];
            this.setData({
                list: allList,
                filteredList: allList,
                hasMore: list.length >= this.data.pageSize
            });
            this.updateTabCounts();
        } catch (e) {
            console.error('loadData error:', e);
            if (this.data.page === 1) this.loadDemoData();
        }
    },

    formatItem(item) {
        const level = FAULT_LEVEL[item.faultLevel] || { label: item.faultLevel, class: 'tag-gray' };
        const role = this.data.role;

        let personInfo = '';
        if (role === 'TECHNICIAN') {
            personInfo = '报修人: ' + (item.reporterName || item.reporter || '');
        } else {
            personInfo = '维修人: ' + (item.status === 'PENDING' ? '待派工' : (item.assigneeName || item.technician || ''));
        }

        return {
            ...item,
            levelLabel: level.label,
            levelClass: level.class,
            personInfo,
            desc: item.faultDesc || item.desc || '',
            showAccept: role === 'TECHNICIAN' && item.status === 'PENDING',
            showComplete: role === 'TECHNICIAN' && item.status === 'IN_PROGRESS'
        };
    },

    loadDemoData() {
        const role = this.data.role;
        const demoList = [
            {
                id: 101, orderNo: 'RO-20231024-01', equipmentName: '电动叉车 3T',
                faultLevel: 'HIGH', status: 'PENDING', reportTime: '2023-10-24 09:30',
                reporter: '李四', technician: '张工', desc: '无法启动，电池电量显示正常但电机无反应。'
            },
            {
                id: 102, orderNo: 'RO-20231023-05', equipmentName: '数控机床 CNC-800',
                faultLevel: 'NORMAL', status: 'IN_PROGRESS', reportTime: '2023-10-23 14:15',
                reporter: '李四', technician: '张工', desc: '冷却液循环系统压力不足。'
            }
        ].map(item => this.formatItem(item));

        // 更新 tab 计数
        const tabs = this.data.tabs.map(tab => {
            let count = 0;
            if (role === 'TECHNICIAN') {
                count = demoList.filter(r => r.status === tab.id).length;
            } else {
                if (tab.id === 'IN_PROGRESS') {
                    count = demoList.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length;
                } else {
                    count = demoList.filter(r => r.status === tab.id).length;
                }
            }
            return { ...tab, count };
        });

        // 过滤
        const filtered = demoList.filter(r => {
            if (role === 'TECHNICIAN') return r.status === this.data.activeTab;
            if (this.data.activeTab === 'IN_PROGRESS') return r.status === 'PENDING' || r.status === 'IN_PROGRESS';
            return r.status === this.data.activeTab;
        });

        this.setData({ list: demoList, filteredList: filtered, tabs });
    },

    updateTabCounts() {
        const list = this.data.list;
        const role = this.data.role;
        const tabs = this.data.tabs.map(tab => {
            let count = 0;
            if (role === 'TECHNICIAN') {
                count = list.filter(r => r.status === tab.id).length;
            } else {
                if (tab.id === 'IN_PROGRESS') {
                    count = list.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length;
                } else {
                    count = list.filter(r => r.status === tab.id).length;
                }
            }
            return { ...tab, count };
        });
        this.setData({ tabs });
    },

    onTabTap(e) {
        const tab = e.currentTarget.dataset.tab;
        this.setData({ activeTab: tab });

        const role = this.data.role;
        const filtered = this.data.list.filter(r => {
            if (role === 'TECHNICIAN') return r.status === tab;
            if (tab === 'IN_PROGRESS') return r.status === 'PENDING' || r.status === 'IN_PROGRESS';
            return r.status === tab;
        });
        this.setData({ filteredList: filtered });
    },

    goDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: '/pages/repair-detail/repair-detail?id=' + id });
    },

    goCreateRepair() {
        if (!app.checkLogin()) return;
        wx.navigateTo({ url: '/pages/repair-create/repair-create' });
    },

    async onAcceptOrder(e) {
        const item = e.currentTarget.dataset.item;
        if (!app.checkLogin()) return;

        wx.showModal({
            title: '确认接单',
            content: '确认接受维修工单 ' + item.orderNo + ' ?',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        await repairApi.start(item.id);
                        wx.showToast({ title: '接单成功' });
                        this.onShow();
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        });
    },

    async onCompleteOrder(e) {
        const item = e.currentTarget.dataset.item;
        if (!app.checkLogin()) return;
        wx.navigateTo({ url: '/pages/repair-detail/repair-detail?id=' + item.id + '&action=complete' });
    },

    onUrge(e) {
        wx.showToast({ title: '已发送催办提醒', icon: 'none' });
    },

    onReachBottom() {
        if (this.data.hasMore && app.globalData.isLoggedIn) {
            this.setData({ page: this.data.page + 1 });
            this.loadData();
        }
    },

    onPullDownRefresh() {
        this.onShow();
        wx.stopPullDownRefresh();
    }
});
