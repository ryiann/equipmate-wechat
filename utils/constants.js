// utils/constants.js

// 后端 API 基础地址 - 请根据实际部署修改
const BASE_URL = 'https://10000cap.funtui.com/api';

// 设备状态映射
const EQUIPMENT_STATUS = {
    'IDLE': { label: '闲置', class: 'status-idle' },
    'IN_USE': { label: '使用中', class: 'status-in-use' },
    'MAINTENANCE': { label: '维修中', class: 'status-maintenance' },
    'SCRAPPED': { label: '报废', class: 'status-scrapped' }
};

// 故障等级映射
const FAULT_LEVEL = {
    'URGENT': { label: '紧急', class: 'tag-red' },
    'HIGH': { label: '高', class: 'tag-orange' },
    'NORMAL': { label: '一般', class: 'tag-blue' },
    'LOW': { label: '低', class: 'tag-gray' }
};

// 工单状态映射
const REPAIR_STATUS = {
    'PENDING': { label: '待处理', class: 'tag-orange' },
    'ASSIGNED': { label: '已派工', class: 'tag-blue' },
    'IN_PROGRESS': { label: '维修中', class: 'tag-orange' },
    'COMPLETED': { label: '已完成', class: 'tag-green' },
    'CLOSED': { label: '已关闭', class: 'tag-gray' }
};

// 设备分类
const EQUIPMENT_CATEGORIES = ['全部', '生产设备', '特种设备', '办公设备', '动力设备'];

// 消息业务类型
const MESSAGE_BIZ_TYPE = {
    'REPAIR_ASSIGN': { label: '维修派工', icon: '/images/icons/repair.png' },
    'REPAIR_COMPLETE': { label: '维修完成', icon: '/images/icons/check.png' },
    'EQUIPMENT_ALERT': { label: '设备预警', icon: '/images/icons/alert.png' },
    'SYSTEM': { label: '系统通知', icon: '/images/icons/bell.png' }
};

module.exports = {
    BASE_URL,
    EQUIPMENT_STATUS,
    FAULT_LEVEL,
    REPAIR_STATUS,
    EQUIPMENT_CATEGORIES,
    MESSAGE_BIZ_TYPE
};
