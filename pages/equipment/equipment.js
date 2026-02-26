// pages/equipment/equipment.js
const app = getApp();
const { equipmentApi } = require('../../utils/api');
const { EQUIPMENT_STATUS, EQUIPMENT_CATEGORIES } = require('../../utils/constants');

Page({
    data: {
        keyword: '',
        activeCategory: '全部',
        categories: EQUIPMENT_CATEGORIES,
        list: [],
        page: 1,
        pageSize: 10,
        hasMore: true,
        showAddBtn: false
    },

    onShow() {
        const isLoggedIn = app.globalData.isLoggedIn;
        const role = app.globalData.role;
        this.setData({ isLoggedIn });

        if (isLoggedIn) {
            this.setData({ page: 1, list: [], hasMore: true });
            this.loadData();
        } else {
            this.loadDemoData();
        }
    },

    // 加载数据
    async loadData() {
        try {
            const params = {
                page: this.data.page,
                pageSize: this.data.pageSize,
                keyword: this.data.keyword
            };
            if (this.data.activeCategory !== '全部') {
                params.categoryName = this.data.activeCategory;
            }

            const res = await equipmentApi.getList(params);
            const list = (res.list || res.records || []).map(item => ({
                ...item,
                statusLabel: (EQUIPMENT_STATUS[item.status] || {}).label || item.status,
                statusClass: (EQUIPMENT_STATUS[item.status] || {}).class || 'status-idle',
                imageUrl: item.imageUrl || item.coverImage || ''
            }));

            this.setData({
                list: this.data.page === 1 ? list : [...this.data.list, ...list],
                hasMore: list.length >= this.data.pageSize
            });
        } catch (e) {
            console.error('loadData error:', e);
            if (this.data.page === 1) this.loadDemoData();
        }
    },

    // 演示数据
    loadDemoData() {
        const demoList = [
            { id: 1, equipmentNo: 'EQ-2023-001', name: '数控机床 CNC-800', category: '生产设备', status: 'IN_USE', location: '一号车间 A区', imageUrl: '' },
            { id: 2, equipmentNo: 'EQ-2023-045', name: '电动叉车 3T', category: '特种设备', status: 'MAINTENANCE', location: '物流仓库', imageUrl: '' },
            { id: 3, equipmentNo: 'EQ-2024-012', name: '工业机器人臂', category: '生产设备', status: 'IDLE', location: '二号车间 B区', imageUrl: '' },
            { id: 4, equipmentNo: 'EQ-2024-088', name: '空气压缩机', category: '动力设备', status: 'IN_USE', location: '动力房', imageUrl: '' }
        ].map(item => ({
            ...item,
            statusLabel: (EQUIPMENT_STATUS[item.status] || {}).label || item.status,
            statusClass: (EQUIPMENT_STATUS[item.status] || {}).class || 'status-idle'
        }));

        // 按分类过滤
        const filtered = this.data.activeCategory === '全部'
            ? demoList
            : demoList.filter(e => e.category === this.data.activeCategory);

        this.setData({ list: filtered });
    },

    // 搜索
    onSearchInput(e) {
        this.setData({ keyword: e.detail.value });
    },

    onSearch() {
        this.setData({ page: 1, list: [], hasMore: true });
        if (app.globalData.isLoggedIn) {
            this.loadData();
        } else {
            this.loadDemoData();
        }
    },

    // 分类切换
    onCategoryTap(e) {
        const cat = e.currentTarget.dataset.cat;
        this.setData({ activeCategory: cat, page: 1, list: [], hasMore: true });
        if (app.globalData.isLoggedIn) {
            this.loadData();
        } else {
            this.loadDemoData();
        }
    },

    // 筛选
    onFilterTap() {
        wx.showActionSheet({
            itemList: ['按名称排序', '按编号排序', '仅显示使用中', '仅显示维修中', '仅显示闲置'],
            success: (res) => {
                // 可扩展筛选逻辑
                console.log('filter:', res.tapIndex);
            }
        });
    },

    // 跳转详情
    goDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: '/pages/equipment-detail/equipment-detail?id=' + id });
    },

    // 新增设备
    goAddEquipment() {
        wx.navigateTo({ url: '/pages/equipment-form/equipment-form' });
    },

    // 上拉加载更多
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
