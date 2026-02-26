// pages/message/message.js
const app = getApp();
const { messageApi } = require('../../utils/api');
const { MESSAGE_BIZ_TYPE } = require('../../utils/constants');

Page({
    data: { list: [] },

    onShow() {
        if (app.globalData.isLoggedIn) {
            this.loadData();
        } else {
            this.loadDemoData();
        }
    },

    async loadData() {
        try {
            const res = await messageApi.getList({ page: 1, pageSize: 20 });
            const list = (res.list || res.records || []).map(this.formatItem);
            this.setData({ list });
        } catch (e) { this.loadDemoData(); }
    },

    formatItem(item) {
        const type = MESSAGE_BIZ_TYPE[item.bizType] || { label: '系统通知' };
        const typeClassMap = { 'REPAIR_ASSIGN': 'type-repair', 'REPAIR_COMPLETE': 'type-repair', 'EQUIPMENT_ALERT': 'type-alert', 'SYSTEM': 'type-system' };
        return {
            ...item,
            typeLabel: type.label,
            typeClass: typeClassMap[item.bizType] || 'type-system',
            contentText: typeof item.content === 'string' ? item.content : JSON.stringify(item.content || '')
        };
    },

    loadDemoData() {
        this.setData({
            list: [
                { id: 1, bizType: 'REPAIR_ASSIGN', title: '维修派工通知', content: '工单 RO-20231024-01 已派工给您，请尽快处理。设备：电动叉车 3T。', pushTime: '2023-10-24 10:00', typeLabel: '维修派工', typeClass: 'type-repair' },
                { id: 2, bizType: 'REPAIR_COMPLETE', title: '维修完成通知', content: '工单 RO-20231020-03 维修已完成，设备：数控机床 CNC-800。', pushTime: '2023-10-20 16:30', typeLabel: '维修完成', typeClass: 'type-repair' },
                { id: 3, bizType: 'EQUIPMENT_ALERT', title: '设备保修到期预警', content: '设备 EQ-2023-045（电动叉车 3T）保修将于 2023-12-31 到期，请提前安排续保。', pushTime: '2023-10-15 09:00', typeLabel: '设备预警', typeClass: 'type-alert' },
                { id: 4, bizType: 'SYSTEM', title: '系统更新通知', content: 'EquipMate 系统已更新至 v2.0 版本，新增扫码报修功能。', pushTime: '2023-10-01 08:00', typeLabel: '系统通知', typeClass: 'type-system' }
            ]
        });
    },

    onMessageTap(e) {
        const item = e.currentTarget.dataset.item;
        if (item.bizType === 'REPAIR_ASSIGN' || item.bizType === 'REPAIR_COMPLETE') {
            if (item.bizId) {
                wx.navigateTo({ url: '/pages/repair-detail/repair-detail?id=' + item.bizId });
            }
        }
    }
});
