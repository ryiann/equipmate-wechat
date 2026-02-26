// pages/profile/profile.js
const app = getApp();
const { userApi, homeApi } = require('../../utils/api');
const { maskPhone } = require('../../utils/util');

Page({
    data: {
        isLoggedIn: false,
        role: 'USER',
        userName: '',
        maskedPhone: '',
        avatarUrl: '',
        roleLabel: '',
        stats: [
            { value: '-', label: '本月报修' },
            { value: '-', label: '本月完成' },
            { value: '-', label: '管理设备' }
        ]
    },

    onShow() {
        const isLoggedIn = app.globalData.isLoggedIn;
        const role = app.globalData.role;
        const userInfo = app.globalData.userInfo || {};

        const roleMap = {
            'ADMIN': '管理员',
            'MANAGER': '主管',
            'TECHNICIAN': '技术员',
            'USER': '操作员'
        };

        const stats = role === 'TECHNICIAN'
            ? [{ value: '-', label: '本月维修' }, { value: '-', label: '本月完成' }, { value: '-', label: '我的关注' }]
            : [{ value: '-', label: '本月报修' }, { value: '-', label: '本月完成' }, { value: '-', label: '管理设备' }];

        this.setData({
            isLoggedIn,
            role,
            userName: userInfo.realName || userInfo.nickname || '用户',
            maskedPhone: maskPhone(userInfo.phone || ''),
            avatarUrl: userInfo.avatarUrl || '',
            roleLabel: roleMap[role] || '操作员',
            stats
        });

        // 从后端获取最新用户信息和统计数据
        if (isLoggedIn) {
            this.loadUserInfo();
            this.loadStats(role);
        }
    },

    async loadUserInfo() {
        try {
            const info = await userApi.getUserInfo();
            if (info) {
                app.globalData.userInfo = info;
                wx.setStorageSync('userInfo', info);
                this.setData({
                    userName: info.realName || info.nickname || this.data.userName,
                    maskedPhone: maskPhone(info.phone || ''),
                    avatarUrl: info.avatarUrl || ''
                });
            }
        } catch (e) {
            console.error('loadUserInfo error:', e);
        }
    },

    async loadStats(role) {
        try {
            const data = await homeApi.getStats();
            if (!data) return;

            const stats = role === 'TECHNICIAN'
                ? [
                    { value: String(data.monthCompleted || 0), label: '本月维修' },
                    { value: String(data.monthOrders > 0 ? Math.round(data.monthCompleted / data.monthOrders * 100) : 0) + '%', label: '完成率' },
                    { value: String(data.myFollowCount || 0), label: '我的关注' }
                ]
                : [
                    { value: String(data.monthOrders || 0), label: '本月报修' },
                    { value: String(data.monthCompleted || 0), label: '本月完成' },
                    { value: String(data.myEquipmentCount || 0), label: '管理设备' }
                ];
            this.setData({ stats });
        } catch (e) {
            console.error('loadStats error:', e);
        }
    },

    goLogin() {
        wx.navigateTo({ url: '/pages/login/login' });
    },

    onMenuTap(e) {
        const action = e.currentTarget.dataset.action;

        if (!app.globalData.isLoggedIn && action !== 'settings') {
            wx.navigateTo({ url: '/pages/login/login' });
            return;
        }

        switch (action) {
            case 'follow':
                // 跳转我的关注设备列表
                wx.switchTab({ url: '/pages/equipment/equipment' });
                break;
            case 'myRepair':
                wx.switchTab({ url: '/pages/repair/repair' });
                break;
            case 'myMaintenance':
                wx.switchTab({ url: '/pages/repair/repair' });
                break;
            case 'settings':
                wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
                break;
        }
    },

    onLogout() {
        wx.showModal({
            title: '提示',
            content: '确认退出登录？',
            success: (res) => {
                if (res.confirm) {
                    app.logout();
                    this.setData({
                        isLoggedIn: false,
                        userName: '',
                        maskedPhone: '',
                        avatarUrl: ''
                    });
                    wx.showToast({ title: '已退出登录', icon: 'none' });
                }
            }
        });
    }
});
