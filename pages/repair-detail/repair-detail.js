// pages/repair-detail/repair-detail.js
const app = getApp();
const { repairApi } = require('../../utils/api');
const { FAULT_LEVEL, REPAIR_STATUS } = require('../../utils/constants');

Page({
    data: {
        id: '', action: '', detail: {}, timeline: [], records: [],
        showAction: false, actionText: '', actionBtnClass: '', statusHeaderClass: '', statusDesc: ''
    },

    onLoad(options) {
        this.setData({ id: options.id || '', action: options.action || '' });
        this.loadDetail();
    },

    async loadDetail() {
        const id = this.data.id;
        if (!id) { this.loadDemoDetail(); return; }
        try {
            const detail = await repairApi.getDetail(id);
            this.processDetail(detail);
        } catch (e) { this.loadDemoDetail(); }
    },

    processDetail(detail) {
        const level = FAULT_LEVEL[detail.faultLevel] || {};
        const status = REPAIR_STATUS[detail.status] || {};
        const role = app.globalData.role;

        const statusMap = {
            'PENDING': { headerClass: 'pending', desc: '等待管理员派工处理' },
            'ASSIGNED': { headerClass: 'pending', desc: '已派工，等待技术员响应' },
            'IN_PROGRESS': { headerClass: 'progress', desc: '技术员正在处理中' },
            'COMPLETED': { headerClass: 'completed', desc: '维修已完成，等待验收' },
            'CLOSED': { headerClass: 'closed', desc: '工单已关闭' }
        };
        const sm = statusMap[detail.status] || {};

        // 时间线
        const timeline = [
            { label: '报修提交', time: detail.reportTime, done: true },
            { label: '管理员派工', time: detail.assignTime, done: !!detail.assignTime },
            { label: '开始维修', time: detail.startTime, done: !!detail.startTime },
            { label: '维修完成', time: detail.completeTime, done: !!detail.completeTime },
            { label: '工单关闭', time: detail.closeTime, done: !!detail.closeTime }
        ];

        // 操作按钮
        let showAction = false, actionText = '', actionBtnClass = '';
        if (role === 'TECHNICIAN') {
            if (detail.status === 'PENDING' || detail.status === 'ASSIGNED') {
                showAction = true; actionText = '接单处理'; actionBtnClass = 'btn-blue';
            } else if (detail.status === 'IN_PROGRESS') {
                showAction = true; actionText = '完成维修'; actionBtnClass = 'btn-green';
            }
        } else if (role === 'ADMIN' || role === 'MANAGER') {
            if (detail.status === 'COMPLETED') {
                showAction = true; actionText = '验收关闭'; actionBtnClass = 'btn-gray';
            }
        }

        const actionTypeMap = { 'DIAGNOSE': '诊断', 'REPAIR': '维修', 'PARTS_REPLACE': '换件', 'TEST': '测试', 'OTHER': '其他' };
        const records = (detail.records || []).map(r => ({
            ...r, actionTypeLabel: actionTypeMap[r.actionType] || r.actionType
        }));

        this.setData({
            detail: { ...detail, levelLabel: level.label, levelClass: level.class, statusLabel: status.label },
            timeline, records, statusHeaderClass: sm.headerClass || '', statusDesc: sm.desc || '',
            showAction, actionText, actionBtnClass
        });
    },

    loadDemoDetail() {
        this.processDetail({
            id: 101, orderNo: 'RO-20231024-01', equipmentName: '电动叉车 3T',
            faultLevel: 'HIGH', status: 'IN_PROGRESS', reportTime: '2023-10-24 09:30',
            reporterName: '李四', assigneeName: '张工', assignTime: '2023-10-24 10:00',
            startTime: '2023-10-24 10:30', faultDesc: '无法启动，电池电量显示正常但电机无反应，可能是接触不良或控制器故障。',
            records: [
                { id: 1, actionType: 'DIAGNOSE', actionDesc: '检查电池连接正常，控制器输出电压异常，初步判断控制器故障。', actionTime: '2023-10-24 11:00', operatorName: '张工' },
                { id: 2, actionType: 'PARTS_REPLACE', actionDesc: '更换电机控制器，型号 MC-3000。', actionTime: '2023-10-24 14:00', operatorName: '张工' }
            ]
        });
    },

    async onAction() {
        const detail = this.data.detail;
        const role = app.globalData.role;
        try {
            if (role === 'TECHNICIAN') {
                if (detail.status === 'PENDING' || detail.status === 'ASSIGNED') {
                    await repairApi.start(detail.id);
                    wx.showToast({ title: '接单成功' });
                } else if (detail.status === 'IN_PROGRESS') {
                    // 弹出输入维修结论
                    wx.showModal({
                        title: '完成维修', content: '确认完成维修？', editable: true, placeholderText: '请输入维修结论',
                        success: async (res) => {
                            if (res.confirm) {
                                await repairApi.complete(detail.id, { repairResult: res.content || '维修完成' });
                                wx.showToast({ title: '已完成' });
                                this.loadDetail();
                            }
                        }
                    });
                    return;
                }
            } else {
                if (detail.status === 'COMPLETED') {
                    await repairApi.close(detail.id);
                    wx.showToast({ title: '已关闭' });
                }
            }
            this.loadDetail();
        } catch (e) { console.error(e); }
    }
});
