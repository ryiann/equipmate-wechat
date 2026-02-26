// pages/equipment-detail/equipment-detail.js
const app = getApp();
const { equipmentApi, repairApi } = require('../../utils/api');
const { EQUIPMENT_STATUS, REPAIR_STATUS } = require('../../utils/constants');

Page({
    data: {
        id: '',
        detail: {},
        images: [],
        repairHistory: [],
        isFollowed: false,
        canEdit: false
    },

    onLoad(options) {
        this.setData({ id: options.id || '' });
        this.loadDetail();
    },

    async loadDetail() {
        const id = this.data.id;
        if (!id) {
            this.loadDemoDetail();
            return;
        }
        try {
            const detail = await equipmentApi.getDetail(id);
            const status = EQUIPMENT_STATUS[detail.status] || {};
            this.setData({
                detail: { ...detail, statusLabel: status.label, statusClass: status.class },
                images: detail.images || [],
                canEdit: app.globalData.role === 'ADMIN' || app.globalData.role === 'MANAGER' || app.globalData.role === 'TECHNICIAN'
            });
        } catch (e) {
            this.loadDemoDetail();
        }
    },

    loadDemoDetail() {
        const demo = {
            id: 1, equipmentNo: 'EQ-2023-001', name: '数控机床 CNC-800',
            brand: '大连机床', model: 'CNC-800X', categoryName: '生产设备',
            status: 'IN_USE', location: '一号车间 A区', purchaseDate: '2023-03-15',
            warrantyEndDate: '2026-03-14', responsibleName: '张工',
            supplier: '大连机床集团', description: '高精度数控加工中心，主要用于复杂零件的铣削加工。'
        };
        const status = EQUIPMENT_STATUS[demo.status] || {};
        this.setData({
            detail: { ...demo, statusLabel: status.label, statusClass: status.class },
            images: [],
            repairHistory: [
                { id: 1, faultDesc: '主轴异响维修', reportTime: '2023-10-20', statusLabel: '已完成' },
                { id: 2, faultDesc: '冷却液系统检修', reportTime: '2023-08-15', statusLabel: '已完成' }
            ],
            canEdit: true
        });
    },

    toggleFollow() {
        if (!app.checkLogin()) return;
        const followed = !this.data.isFollowed;
        this.setData({ isFollowed: followed });
        wx.showToast({ title: followed ? '已关注' : '已取消关注', icon: 'none' });
        // equipmentApi.toggleFollow(this.data.id);
    },

    goCreateRepair() {
        if (!app.checkLogin()) return;
        wx.navigateTo({
            url: '/pages/repair-create/repair-create?equipmentId=' + this.data.id + '&equipmentName=' + this.data.detail.name
        });
    },

    goEdit() {
        wx.navigateTo({ url: '/pages/equipment-form/equipment-form?id=' + this.data.id });
    }
});
