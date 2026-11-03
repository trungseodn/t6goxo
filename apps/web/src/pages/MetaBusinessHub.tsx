import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useZTTeamFacebookStore } from '../stores/facebookStore';
import { useUIStore } from '../stores/uiStore';
import { ztteam_decodeHtmlEntity } from '../utils/stringUtils';
import api from '../services/api';

/**
 * Trang Quản Lý Doanh Nghiệp (Meta Business Hub)
 * Hiển thị đầy đủ 4 thông tin cốt lõi:
 * 1. BM Name (Tên Doanh Nghiệp & ID)
 * 2. Apps (Tên Meta App & App ID)
 * 3. System User name (Tên Người Dùng Hệ Thống & UID)
 * 4. Số Lượng Fanpage (Số lượng Page trực thuộc quản lý)
 * Tuân thủ nghiêm ngặt Style Guidelines: theme dark, chuẩn UI FacebookPageSettings, không dùng hồng/tím.
 */
export default function MetaBusinessHub() {
  const navigate = useNavigate();
  const { businesses, ztteam_fetchBusinesses, ztteam_connectBMToken, ztteam_deleteAccount } = useZTTeamFacebookStore();
  const { ztteam_showToast, ztteam_showConfirm } = useUIStore();

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);

  /** Chế độ xem: 1 = Bảng Tổng Quan (Table), 2 = Thẻ Chi Tiết (Cards) */
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  /** Modal xem nhanh danh sách Fanpage của 1 BM khi ở chế độ Table */
  const [quickViewBiz, setQuickViewBiz] = useState<any | null>(null);

  /** Load danh sách BM khi mở trang */
  useEffect(() => {
    ztteam_loadData();
  }, []);

  const ztteam_loadData = async () => {
    setIsLoadingData(true);
    try {
      await ztteam_fetchBusinesses();
    } catch (e: any) {
      ztteam_showToast('Không thể tải danh sách Doanh Nghiệp', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  /** Xử lý submit Token BM */
  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      ztteam_showToast('Vui lòng dán chuỗi Token Meta Business', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ztteam_connectBMToken(tokenInput.trim());
      ztteam_showToast(res?.message || 'Kết nối Doanh Nghiệp BM thành công!', 'success');
      setTokenInput('');
      setIsConnectModalOpen(false);
      await ztteam_loadData();
    } catch (err: any) {
      ztteam_showToast(err.message || 'Lỗi khi kết nối Token BM', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Xử lý đồng bộ lại Fanpage cho 1 BM */
  const handleSyncAccount = async (accountId: string, accountName: string) => {
    try {
      setSyncingAccountId(accountId);
      const res = await api.post(`/facebook/pages/${accountId}/fetch`);
      if (res.data) {
        ztteam_showToast(`Đã đồng bộ lại danh sách Fanpage cho "${accountName}" thành công!`, 'success');
        await ztteam_loadData();
      }
    } catch (err: any) {
      ztteam_showToast(err.response?.data?.message || err.message || 'Lỗi khi đồng bộ Fanpage', 'error');
    } finally {
      setSyncingAccountId(null);
    }
  };

  /** Xử lý xóa BM / Hủy kết nối */
  const handleDeleteBusiness = async (accountId: string, businessName: string) => {
    const confirm = await ztteam_showConfirm(
      'Hủy Kết Nối Doanh Nghiệp',
      `Bạn có chắc chắn muốn hủy kết nối Doanh Nghiệp "${businessName}"? Toàn bộ Fanpage thuộc BM này sẽ được cập nhật trạng thái tương ứng.`
    );
    if (!confirm) return;

    try {
      await ztteam_deleteAccount(accountId);
      ztteam_showToast(`Đã hủy kết nối Doanh Nghiệp "${businessName}" thành công!`, 'success');
      await ztteam_loadData();
    } catch (e: any) {
      ztteam_showToast(e.message || 'Lỗi khi xóa Doanh Nghiệp', 'error');
    }
  };

  /** Tính toán thống kê */
  const totalBMCount = new Set(businesses.map(b => b.businessName || b.businessId).filter(Boolean)).size || businesses.length;
  const totalSystemUsers = businesses.length;
  const totalPagesInBM = businesses.reduce((acc, b) => acc + (b.pages?.length || b.pagesCount || 0), 0);
  const uniqueAppsCount = new Set(businesses.map(b => b.appId || b.appName).filter(Boolean)).size;

  /** Lọc tìm kiếm */
  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const q = searchQuery.toLowerCase().trim();
    return businesses.filter((b: any) => {
      const bmName = (b.businessName || '').toLowerCase();
      const appName = (b.appName || '').toLowerCase();
      const appId = (b.appId || '').toLowerCase();
      const suName = (b.name || b.systemUserName || '').toLowerCase();
      const hasPage = (b.pages || []).some((p: any) => (p.name || '').toLowerCase().includes(q));
      return bmName.includes(q) || appName.includes(q) || appId.includes(q) || suName.includes(q) || hasPage;
    });
  }, [businesses, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/** 1. Header Banner */}
      <div className="bg-fb-surface rounded-2xl shadow-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-700/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">domain</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-fb-text tracking-tight">
              Quản Lý Doanh Nghiệp (Meta Business Hub)
            </h2>
          </div>
          <p className="text-sm font-medium text-fb-text-muted mt-1.5">
            Quản trị tập trung các Business Manager (Multi-BM), Meta Apps, System Users và Fanpages trực thuộc.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/meta-bm-guide"
            className="px-3.5 py-2.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
            title="Xem hướng dẫn chi tiết tạo Token BM và cấp quyền 6 bước"
          >
            <span className="material-symbols-outlined text-base">menu_book</span>
            <span>Hướng Dẫn Token</span>
          </Link>

          <button
            onClick={ztteam_loadData}
            disabled={isLoadingData}
            className="px-3.5 py-2.5 bg-fb-surface-hover hover:bg-fb-surface-hover/80 text-fb-text rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
            title="Tải lại danh sách"
          >
            <span className={`material-symbols-outlined text-base ${isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
            <span>Tải Lại</span>
          </button>

          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="bg-gradient-to-r from-fb-blue to-cyan-500 hover:opacity-90 text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Thêm Token BM / System User</span>
          </button>
        </div>
      </div>

      {/** 2. Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/** Card 1: Doanh Nghiệp BM */}
        <div className="bg-gradient-to-br from-fb-surface via-fb-surface to-blue-950/30 rounded-2xl p-4 shadow-lg flex flex-col justify-between border border-blue-500/20">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] sm:text-xs font-black text-blue-400 uppercase tracking-wider">Doanh Nghiệp (BM)</p>
              <h3 className="text-2xl sm:text-3xl font-black text-fb-text mt-1">{totalBMCount}</h3>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/15 text-blue-400 rounded-xl">
              <span className="material-symbols-outlined text-2xl">corporate_fare</span>
            </div>
          </div>
          <p className="text-[11px] text-fb-text-muted">Quản trị độc lập</p>
        </div>

        {/** Card 2: Meta Apps */}
        <div className="bg-gradient-to-br from-fb-surface via-fb-surface to-emerald-950/30 rounded-2xl p-4 shadow-lg flex flex-col justify-between border border-emerald-500/20">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] sm:text-xs font-black text-emerald-400 uppercase tracking-wider">Meta Apps</p>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{uniqueAppsCount || 1}</h3>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/15 text-emerald-400 rounded-xl">
              <span className="material-symbols-outlined text-2xl">apps</span>
            </div>
          </div>
          <p className="text-[11px] text-fb-text-muted">Chia tải Rate Limit an toàn</p>
        </div>

        {/** Card 3: System Users */}
        <div className="bg-gradient-to-br from-fb-surface via-fb-surface to-cyan-950/30 rounded-2xl p-4 shadow-lg flex flex-col justify-between border border-cyan-500/20">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] sm:text-xs font-black text-cyan-400 uppercase tracking-wider">System Users</p>
              <h3 className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">{totalSystemUsers}</h3>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/15 text-cyan-400 rounded-xl">
              <span className="material-symbols-outlined text-2xl">badge</span>
            </div>
          </div>
          <p className="text-[11px] text-fb-text-muted">Tài khoản ủy quyền hệ thống</p>
        </div>

        {/** Card 4: Fanpages */}
        <div className="bg-gradient-to-br from-fb-surface via-fb-surface to-amber-950/30 rounded-2xl p-4 shadow-lg flex flex-col justify-between border border-amber-500/20">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] sm:text-xs font-black text-amber-400 uppercase tracking-wider">Số Lượng Fanpage</p>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{totalPagesInBM}</h3>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-amber-500/15 text-amber-400 rounded-xl">
              <span className="material-symbols-outlined text-2xl">pages</span>
            </div>
          </div>
          <p className="text-[11px] text-fb-text-muted">Đang quản lý xuất bản</p>
        </div>
      </div>

      {/** 3. Thanh Điều Hướng Chế Độ Xem (Tabs Navigation - Chuẩn FacebookPageSettings) */}
      <div className="bg-fb-surface rounded-2xl shadow-sm border border-slate-700/50 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/** Nút chọn Tab */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab(1)}
            className={`px-4 py-2 font-bold text-xs sm:text-sm flex items-center gap-2 rounded-xl transition-all ${
              activeTab === 1
                ? 'bg-fb-blue text-white shadow-md shadow-blue-500/20'
                : 'text-fb-text-muted hover:text-fb-text hover:bg-fb-surface-hover'
            }`}
          >
            <span className="material-symbols-outlined text-base">table_chart</span>
            <span>Bảng Tổng Quan (Table)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900/60 text-white font-mono">
              {businesses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab(2)}
            className={`px-4 py-2 font-bold text-xs sm:text-sm flex items-center gap-2 rounded-xl transition-all ${
              activeTab === 2
                ? 'bg-fb-blue text-white shadow-md shadow-blue-500/20'
                : 'text-fb-text-muted hover:text-fb-text hover:bg-fb-surface-hover'
            }`}
          >
            <span className="material-symbols-outlined text-base">grid_view</span>
            <span>Thẻ Chi Tiết &amp; Fanpage (Cards)</span>
          </button>
        </div>

        {/** Ô Tìm Kiếm Nhanh */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo BM, App, System User..."
            className="w-full pl-9 pr-8 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-fb-blue transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/** 4. TAB 1: BẢNG TỔNG QUAN CHI TIẾT (Hiển thị đầy đủ 4 thông tin cốt lõi) */}
      {activeTab === 1 && (
        <div className="bg-fb-surface rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 border-b border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-fb-text flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-lg">view_list</span>
                <span>Bảng Tổng Hợp Chi Tiết Doanh Nghiệp &amp; System Users</span>
              </h3>
              <p className="text-xs text-fb-text-muted mt-0.5">
                Hiển thị đầy đủ BM Name, Apps, System User name, Số Lượng Fanpage và trạng thái ủy quyền.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Tổng số: <b className="text-white">{filteredBusinesses.length}</b> tài khoản
            </span>
          </div>

          {filteredBusinesses.length === 0 ? (
            <div className="p-12 text-center text-fb-text-muted text-xs">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-2 block">search_off</span>
              Không tìm thấy Doanh Nghiệp hoặc System User nào phù hợp với từ khóa "{searchQuery}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-fb-text border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-700/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4 min-w-[200px]">
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <span className="material-symbols-outlined text-base">corporate_fare</span>
                        <span>BM Name (Doanh Nghiệp)</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 min-w-[190px]">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span className="material-symbols-outlined text-base">apps</span>
                        <span>Apps (Meta App)</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 min-w-[190px]">
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <span className="material-symbols-outlined text-base">badge</span>
                        <span>System User name</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 min-w-[160px] text-center">
                      <div className="flex items-center justify-center gap-1.5 text-amber-400">
                        <span className="material-symbols-outlined text-base">pages</span>
                        <span>Số Lượng Fanpage</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 w-32 text-center">Trạng Thái</th>
                    <th className="py-3.5 px-4 w-40 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {filteredBusinesses.map((biz: any, idx: number) => {
                    const isSyncing = syncingAccountId === biz.id;
                    const pageCount = biz.pages?.length || biz.pagesCount || 0;

                    return (
                      <tr key={biz.id} className="hover:bg-slate-800/40 transition-colors">
                        {/** Cột #: STT */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-bold">
                          {idx + 1}
                        </td>

                        {/** Cột 1: BM Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-black shrink-0">
                              <span className="material-symbols-outlined text-base">corporate_fare</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-fb-text text-sm truncate" title={biz.businessName}>
                                {biz.businessName || 'Doanh Nghiệp BM'}
                              </p>
                              {biz.businessId ? (
                                <p className="text-[11px] text-slate-400 font-mono">BM ID: {biz.businessId}</p>
                              ) : (
                                <span className="text-[10px] text-slate-500">ID tự động</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/** Cột 2: Apps (Meta App) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-400 text-base shrink-0">apps</span>
                            <div className="min-w-0">
                              <p className="font-bold text-emerald-400 truncate" title={biz.appName}>
                                {biz.appName || 'Meta App'}
                              </p>
                              {biz.appId ? (
                                <p className="text-[11px] text-slate-400 font-mono">App ID: {biz.appId}</p>
                              ) : (
                                <span className="text-[10px] text-slate-500">N/A</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/** Cột 3: System User name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-cyan-400 text-base shrink-0">badge</span>
                            <div className="min-w-0">
                              <p className="font-bold text-cyan-300 truncate" title={biz.name || biz.systemUserName}>
                                {biz.name || biz.systemUserName || 'System User'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">UID: {biz.fbUserId}</p>
                            </div>
                          </div>
                        </td>

                        {/** Cột 4: Số Lượng Fanpage */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setQuickViewBiz(biz)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-black text-xs transition-all cursor-pointer shadow-xs"
                            title="Bấm để xem danh sách Fanpage của System User này"
                          >
                            <span className="material-symbols-outlined text-sm">pages</span>
                            <span>{pageCount} Fanpages</span>
                            <span className="material-symbols-outlined text-xs">visibility</span>
                          </button>
                        </td>

                        {/** Cột 5: Trạng Thái Token */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Vĩnh Viễn</span>
                          </span>
                        </td>

                        {/** Cột 6: Thao Tác */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleSyncAccount(biz.id, biz.businessName || biz.name)}
                              disabled={isSyncing}
                              className="px-2.5 py-1 bg-fb-surface-hover hover:bg-slate-700 text-fb-text rounded-lg text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                              title="Đồng bộ lại danh sách Fanpage"
                            >
                              <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                              <span>Đồng bộ</span>
                            </button>

                            <button
                              onClick={() => handleDeleteBusiness(biz.id, biz.businessName || biz.name)}
                              className="px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg text-xs font-bold transition-colors"
                              title="Hủy kết nối Doanh Nghiệp"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/** 5. TAB 2: DANH SÁCH THẺ CHI TIẾT (Cards View với 4-Metric Bar nổi bật) */}
      {activeTab === 2 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {filteredBusinesses.length === 0 ? (
            <div className="bg-fb-surface rounded-2xl p-12 text-center border border-slate-700/40">
              <span className="material-symbols-outlined text-5xl text-fb-text-muted opacity-40 mb-3">domain_disabled</span>
              <h4 className="text-lg font-bold text-fb-text">Không tìm thấy Doanh Nghiệp nào</h4>
              <p className="text-xs text-fb-text-muted mt-1 max-w-md mx-auto">
                Hãy kiểm tra lại từ khóa tìm kiếm hoặc kết nối thêm Token BM mới.
              </p>
            </div>
          ) : (
            filteredBusinesses.map((biz: any) => {
              const isSystemUser = biz.accountType === 'SYSTEM_USER';
              const isSyncing = syncingAccountId === biz.id;
              const pageCount = biz.pages?.length || biz.pagesCount || 0;

              return (
                <div key={biz.id} className="bg-fb-surface rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden">
                  {/** Header Card của BM */}
                  <div className="p-5 bg-fb-surface-hover/50 border-b border-slate-700/40 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                          <span className="material-symbols-outlined text-2xl">corporate_fare</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black text-fb-text tracking-tight">{biz.businessName || 'Doanh Nghiệp BM'}</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              {isSystemUser ? '⚡ BM System User' : '👤 Tài Khoản Cá Nhân'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>{biz.tokenExpiry === 'NEVER' ? 'Vĩnh Viễn (Never Expire)' : 'Đang Hoạt Động'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/** Action buttons trên Header BM */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => handleSyncAccount(biz.id, biz.businessName || biz.name)}
                          disabled={isSyncing}
                          className="px-3 py-1.5 bg-fb-surface-hover hover:bg-slate-700 text-fb-text rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          title="Quét tìm Fanpage mới được gán cho System User này"
                        >
                          <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                          <span>Đồng Bộ Fanpage</span>
                        </button>

                        <button
                          onClick={() => handleDeleteBusiness(biz.id, biz.businessName || biz.name)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-full text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Hủy kết nối Doanh Nghiệp này"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          <span>Hủy BM</span>
                        </button>
                      </div>
                    </div>

                    {/** THANH 4 THÔNG SỐ CỐT LÕI (BM Name, Apps, System User name, Số Lượng Fanpage) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
                      {/** Thông số 1: BM Name */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-blue-400">corporate_fare</span>
                          <span>BM Name</span>
                        </span>
                        <p className="text-sm font-bold text-fb-text truncate" title={biz.businessName}>
                          {biz.businessName || 'Doanh Nghiệp BM'}
                        </p>
                        {biz.businessId && (
                          <p className="text-[10px] text-slate-400 font-mono">BM ID: {biz.businessId}</p>
                        )}
                      </div>

                      {/** Thông số 2: Apps */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-emerald-400">apps</span>
                          <span>Apps (Meta App)</span>
                        </span>
                        <p className="text-sm font-bold text-emerald-400 truncate" title={biz.appName}>
                          {biz.appName || 'Meta App'}
                        </p>
                        {biz.appId && (
                          <p className="text-[10px] text-slate-400 font-mono">App ID: {biz.appId}</p>
                        )}
                      </div>

                      {/** Thông số 3: System User name */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-cyan-400">badge</span>
                          <span>System User name</span>
                        </span>
                        <p className="text-sm font-bold text-cyan-300 truncate" title={biz.name || biz.systemUserName}>
                          {biz.name || biz.systemUserName || 'System User'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">UID: {biz.fbUserId}</p>
                      </div>

                      {/** Thông số 4: Số Lượng Fanpage */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-amber-400">pages</span>
                          <span>Số Lượng Fanpage</span>
                        </span>
                        <p className="text-sm font-black text-amber-400">
                          {pageCount} Fanpages
                        </p>
                        <p className="text-[10px] text-slate-400">Trực thuộc quản lý</p>
                      </div>
                    </div>
                  </div>

                  {/** Body: Danh sách Fanpage thuộc BM */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-blue-400">pages</span>
                        <span>Danh Sách Fanpage ({pageCount} Pages)</span>
                      </h4>
                      <span className="text-xs text-fb-text-muted">Được gán quyền tạo Reel &amp; xuất bản nội dung</span>
                    </div>

                    {(!biz.pages || biz.pages.length === 0) ? (
                      <div className="p-6 rounded-xl bg-slate-900/40 text-center text-fb-text-muted text-xs">
                        Chưa có Fanpage nào được gán cho System User này trong Meta Business Manager.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {biz.pages.map((p: any) => (
                          <div key={p.id} className="p-3.5 rounded-xl bg-fb-surface-hover/40 border border-slate-700/40 flex items-center justify-between gap-3 hover:bg-fb-surface-hover/70 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              {p.avatar ? (
                                <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-900" />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold shrink-0">
                                  <span className="material-symbols-outlined text-lg">pages</span>
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-fb-text truncate">{ztteam_decodeHtmlEntity(p.name)}</p>
                                <div className="flex items-center gap-1.5 text-[11px] text-fb-text-muted mt-0.5">
                                  <span>{(p.followersCount || 0).toLocaleString()} sub</span>
                                  <span>•</span>
                                  <span className="truncate">ID: {p.id}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => navigate(`/facebook/pages/${p.id}/settings`)}
                              className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                              title="Mở cấu hình Fanpage này"
                            >
                              <span>Cài đặt</span>
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/** 6. Modal Xem Nhanh Fanpage (Khi bấm từ Bảng Tổng Quan) */}
      {quickViewBiz && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-fb-surface w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-700/60 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">pages</span>
                </div>
                <div>
                  <h4 className="text-base font-black text-fb-text">
                    Fanpages Trực Thuộc: {quickViewBiz.businessName || 'Doanh Nghiệp'}
                  </h4>
                  <p className="text-xs text-fb-text-muted">
                    System User: <b className="text-cyan-300">{quickViewBiz.name || quickViewBiz.systemUserName}</b> • Meta App: <b className="text-emerald-400">{quickViewBiz.appName}</b>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickViewBiz(null)}
                className="w-8 h-8 rounded-full bg-fb-surface-hover text-fb-text-muted hover:text-white flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {(!quickViewBiz.pages || quickViewBiz.pages.length === 0) ? (
                <div className="p-8 text-center text-fb-text-muted text-xs">
                  Chưa có Fanpage nào được liên kết cho System User này.
                </div>
              ) : (
                quickViewBiz.pages.map((p: any) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold shrink-0">
                          <span className="material-symbols-outlined text-base">pages</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-fb-text truncate">{ztteam_decodeHtmlEntity(p.name)}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Page ID: {p.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setQuickViewBiz(null);
                        navigate(`/facebook/pages/${p.id}/settings`);
                      }}
                      className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                    >
                      <span>Cài Đặt</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-700/40 flex justify-end shrink-0">
              <button
                onClick={() => setQuickViewBiz(null)}
                className="px-4 py-2 bg-fb-surface-hover hover:bg-slate-700 text-fb-text rounded-full text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/** 7. Modal Kết Nối Token BM */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-fb-surface w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">vpn_key</span>
                </div>
                <div>
                  <h4 className="text-base font-black text-fb-text">Kết Nối Token Meta Business (BM)</h4>
                  <p className="text-xs text-fb-text-muted">Nhận diện tự động BM, App, System User và Fanpage</p>
                </div>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-fb-surface-hover text-fb-text-muted hover:text-white flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleConnectToken} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-fb-text mb-1.5">
                  Dán chuỗi Token System User (EAAT...):
                </label>
                <textarea
                  rows={4}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Dán chuỗi token bắt đầu bằng EAAT... vào đây"
                  className="w-full px-3.5 py-2.5 bg-fb-surface-hover border border-slate-700/60 rounded-xl text-xs text-fb-text focus:outline-none focus:border-fb-blue transition-colors font-mono"
                  disabled={isSubmitting}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
                <p className="font-bold flex items-center gap-1 text-blue-400">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Cơ chế tự động 100%:
                </p>
                <p>• Hệ thống sẽ tự động xác định Doanh Nghiệp (BM), Meta App và các Fanpage đã cấp quyền.</p>
                <p>• Token System User có thời hạn <b>VĨNH VIỄN</b>, không bao giờ lo checkpoint hay hết hạn sau 60 ngày.</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-fb-surface-hover hover:bg-slate-700 text-fb-text rounded-full text-xs font-bold transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !tokenInput.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-fb-blue to-cyan-500 hover:opacity-90 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      <span>Đang Phân Tích &amp; Kết Nối...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>Xác Thực &amp; Đồng Bộ BM</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
