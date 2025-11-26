import { HomeIcon } from '@heroicons/react/24/outline';
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import { FaStore } from "react-icons/fa";

const ROOT_DASHBOARDS = '/dashboards'

const path = (root, item) => `${root}${item}`;

export const dashboards = {
    id: 'dashboards',
    type: NAV_TYPE_ROOT,
    path: '/dashboards',
    title: 'Dashboards',
    transKey: 'nav.dashboards.dashboards',
    Icon: DashboardsIcon,
    childs: [
        {
            id: 'dashboards.home',
            path: path(ROOT_DASHBOARDS, '/home'),
            type: NAV_TYPE_ITEM,
            title: 'Home',
            transKey: 'Home',
            Icon: HomeIcon,
        },
        {
            id: 'dashboards.survey',
            path: path(ROOT_DASHBOARDS, '/survey'),
            type: NAV_TYPE_ITEM,
            title: 'Survey',
            transKey: 'survey',
            Icon: FaStore
        },
        {
            id: 'dashboards.UMKM',
            path: path(ROOT_DASHBOARDS, '/UMKM'),
            type: NAV_TYPE_ITEM,
            title: 'UMKM',
            transKey: 'UMKM',
            Icon: FaStore
        },
        {
            id: 'dashboards.pertanyaan',
            path: path(ROOT_DASHBOARDS, '/pertanyaan'),
            type: NAV_TYPE_ITEM,
            title: 'Pertanyaan',
            transKey: 'Pertanyaan',
            Icon: FaStore
        },
        {
            id: 'dashboards.users',
            path: path(ROOT_DASHBOARDS, '/users'),
            type: NAV_TYPE_ITEM,
            title: 'users',
            transKey: 'Users',
            Icon: FaStore
        },
    ]
}
