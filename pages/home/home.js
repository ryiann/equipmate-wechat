// pages/home/home.js
const app = getApp();
const { homeApi, repairApi } = require('../../utils/api');
const { REPAIR_STATUS, FAULT_LEVEL } = require('../../utils/constants');
const { relativeTime } = require('../../utils/util');

Page({
    data: {
        isLoggedIn: false,
        role: 'USER',
        headerTitle: 'EquipMate',
        headerSubtitle: '企业设备全生命周期管理平台',
        unreadCount: 0,
        stats: [
            { label: '设备总数', value: '-' },
            { label: '维修中', value: '-' },
            { label: '今日报修', value: '-' }
        ],
        actions: [],
        taskTitle: '待办工单',
        tasks: []
    },

    onShow() {
        const isLoggedIn = app.globalData.isLoggedIn;
        const role = app.globalData.role;

        this.setData({ isLoggedIn, role });
        this.updateHeaderData(isLoggedIn, role);
        this.updateActions(role);

        if (isLoggedIn) {
            this.loadData();
        }
    },

    // 更新头部数据
    updateHeaderData(isLoggedIn, role) {
        if (!isLoggedIn) {
            this.setData({
                headerTitle: 'EquipMate',
                headerSubtitle: '企业设备全生命周期管理平台',
                stats: [
                    { label: '设备总数', value: '-' },
                    { label: '维修中', value: '-' },
                    { label: '今日报修', value: '-' }
                ]
            });
            return;
        }

        const userInfo = app.globalData.userInfo || {};
        if (role === 'TECHNICIAN') {
            this.setData({
                headerTitle: '早安，' + (userInfo.realName || userInfo.nickname || '技术员'),
                headerSubtitle: (userInfo.department || '设备科') + ' · 维修技术员',
                taskTitle: '待办工单'
            });
        } else {
            this.setData({
                headerTitle: '早安，' + (userInfo.realName || userInfo.nickname || '用户'),
                headerSubtitle: (userInfo.department || '') + ' · 生产操作员',
                taskTitle: '最新报修进度'
            });
        }
    },

    // 更新快捷操作
    updateActions(role) {
        const actions = role === 'TECHNICIAN' ? [
            { icon: '/images/icons/scan-blue.png', label: '扫码报修', action: 'scan', bgClass: 'bg-blue' },
            { icon: '/images/icons/wrench-orange.png', label: '快速派工', action: 'dispatch', bgClass: 'bg-orange' },
            { icon: '/images/icons/file-green.png', label: '设备台账', action: 'equipment', bgClass: 'bg-green' },
            { icon: '/images/icons/activity-purple.png', label: '运行状态', action: 'status', bgClass: 'bg-purple' }
        ] : [
            { icon: '/images/icons/scan-blue.png', label: '扫码报修', action: 'scan', bgClass: 'bg-blue' },
            { icon: '/images/icons/file-orange.png', label: '我的报修', action: 'myRepair', bgClass: 'bg-orange' },
            { icon: '/images/icons/activity-green.png', label: '设备台账', action: 'equipment', bgClass: 'bg-green' },
            { icon: '/images/icons/bell-purple.png', label: '消息通知', action: 'message', bgClass: 'bg-purple' }
        ];
        this.setData({ actions });
    },

    // 加载数据
    async loadData() {
        try {
            const role = this.data.role;
            const statsData = await homeApi.getStats();

            // 使用真实统计数据
            if (role === 'TECHNICIAN') {
                this.setData({
                    stats: [
                        { label: '正常运行', value: String(statsData.equipmentInUse || 0) },
                        { label: '维修中', value: String(statsData.equipmentMaintenance || 0) },
                        { label: '待处理工单', value: String(statsData.pendingOrders || 0) }
                    ]
                });
            } else {
                this.setData({
                    stats: [
                        { label: '我管理的', value: String(statsData.myEquipmentCount || 0) },
                        { label: '报修中', value: String(statsData.equipmentMaintenance || 0) },
                        { label: '本月已解决', value: String(statsData.monthCompleted || 0) }
                    ]
                });
            }

            // 待办工单列表
            const pendingList = statsData.pendingOrderList || [];
            const tasks = pendingList.map(order => ({
                id: order.id,
                title: (order.equipmentName || '') + ' ' + (order.faultDesc || '').substring(0, 20),
                statusText: FAULT_LEVEL[order.faultLevel] ? FAULT_LEVEL[order.faultLevel].label : order.faultLevel,
                statusTagClass: FAULT_LEVEL[order.faultLevel] ? FAULT_LEVEL[order.faultLevel].class : 'tag-blue',
                time: order.reportTime ? relativeTime(order.reportTime) : '',
                desc: order.faultDesc || '',
                user: '报修人：' + (order.reporterName || '未知'),
                action: role === 'TECHNICIAN' ? '去处理' : '催办',
                actionClass: role === 'TECHNICIAN' ? 'btn-primary' : 'btn-outline'
            }));
            this.setData({ tasks });

        } catch (e) {
            console.error('loadData error:', e);
            // 网络异常时使用演示数据作为 fallback
            this.loadDemoData(this.data.role);
        }
    },

    // 演示数据
    loadDemoData(role) {
        if (role === 'TECHNICIAN') {
            this.setData({
                stats: [
                    { label: '正常运行', value: '128' },
                    { label: '维修中', value: '5' },
                    { label: '待处理工单', value: '2' }
                ],
                tasks: [
                    {
                        id: 1,
                        title: '数控机床 CNC-800 异响',
                        statusText: '紧急',
                        statusTagClass: 'tag-red',
                        time: '10分钟前',
                        desc: '设备在高速运转时主轴出现明显异响，伴随轻微震动，已停机等待检修。',
                        user: '报修人：李四 · 一号车间',
                        action: '去处理',
                        actionClass: 'btn-primary'
                    },
                    {
                        id: 2,
                        title: '电动叉车 3T 无法启动',
                        statusText: '一般',
                        statusTagClass: 'tag-blue',
                        time: '2小时前',
                        desc: '电池电量显示正常但电机无反应，可能是接触不良。',
                        user: '报修人：王五 · 物流仓库',
                        action: '去处理',
                        actionClass: 'btn-primary'
                    }
                ]
            });
        } else {
            this.setData({
                stats: [
                    { label: '我管理的', value: '12' },
                    { label: '报修中', value: '1' },
                    { label: '本月已解决', value: '3' }
                ],
                tasks: [
                    {
                        id: 1,
                        title: '数控机床 CNC-800 异响',
                        statusText: '维修中',
                        statusTagClass: 'tag-orange',
                        time: '10分钟前',
                        desc: '设备在高速运转时主轴出现明显异响，伴随轻微震动，已停机等待检修。',
                        user: '维修人：张工 · 设备科',
                        action: '催办',
                        actionClass: 'btn-outline'
                    }
                ]
            });
        }
    },

    // 快捷操作点击
    onActionTap(e) {
        const action = e.currentTarget.dataset.action;
        if (!app.globalData.isLoggedIn) {
            wx.navigateTo({ url: '/pages/login/login' });
            return;
        }
        switch (action) {
            case 'scan':
                wx.scanCode({
                    success: (res) => {
                        wx.navigateTo({ url: '/pages/repair-create/repair-create?code=' + res.result });
                    }
                });
                break;
            case 'equipment':
                wx.switchTab({ url: '/pages/equipment/equipment' });
                break;
            case 'dispatch':
                wx.switchTab({ url: '/pages/repair/repair' });
                break;
            case 'myRepair':
                wx.switchTab({ url: '/pages/repair/repair' });
                break;
            case 'status':
                wx.switchTab({ url: '/pages/equipment/equipment' });
                break;
            case 'message':
                wx.navigateTo({ url: '/pages/message/message' });
                break;
        }
    },

    // 跳转消息
    goMessage() {
        if (!app.checkLogin()) return;
        wx.navigateTo({ url: '/pages/message/message' });
    },

    // 跳转维修列表
    goRepairList() {
        wx.switchTab({ url: '/pages/repair/repair' });
    },

    // 跳转维修详情
    goRepairDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: '/pages/repair-detail/repair-detail?id=' + id });
    },

    // 工单操作
    onTaskAction(e) {
        const task = e.currentTarget.dataset.task;
        if (!app.checkLogin()) return;
        wx.navigateTo({ url: '/pages/repair-detail/repair-detail?id=' + task.id });
    },

    onPullDownRefresh() {
        this.onShow();
        wx.stopPullDownRefresh();
    }
});
