import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZTTeamFacebookStore } from '../stores/facebookStore';
import { useUIStore } from '../stores/uiStore';
import CustomDropdown from '../components/CustomDropdown';
import api from '../services/api';

/** Danh sách Preset Chủ Đề được tối ưu hóa cho Muse.ai & Meta Graph API (100% English Bio & Description) */
const THEME_PRESETS = [
  {
    id: 'story_narrative',
    name: '📖 Kể Chuyện Đời Sống & Cảm Xúc (Story)',
    desc: 'Tone màu điện ảnh ấm áp, câu chuyện đời sống, nhân văn, tình cảm chạm đến trái tim.',
    avatarPrompt: 'Create a 1:1 square emotive profile picture avatar for a narrative storytelling page named "{PAGE_NAME}". Theme: heartfelt human stories, life drama and emotional narrative, warm golden hour lighting, deep atmospheric textures, elegant artistic symbol, 8k resolution, photorealistic.',
    coverPrompt: 'Create a breathtaking 16:9 cinematic cover banner for "{PAGE_NAME}". Theme: emotional storytelling journey, human life narrative, picturesque cinematic landscape with warm nostalgic lighting, deeply evocative atmosphere, 8k masterpiece.',
    bioTemplate: '{PAGE_NAME} — Heartfelt human stories & inspiring life journeys.',
    descTemplate: 'Welcome to {PAGE_NAME}. Your daily destination for emotional life stories, heartwarming human experiences, and touching narratives that inspire and heal.',
  },
  {
    id: 'drama_story',
    name: '🎭 Kịch Tính & Góc Khuất Cuộc Đời (Drama Story)',
    desc: 'Không khí ly kỳ, kịch tính, những tình huống trắc trở, xung đột và bài học cuộc sống.',
    avatarPrompt: 'Create a 1:1 square profile picture avatar for a drama storytelling page named "{PAGE_NAME}". Theme: life drama, emotional tension, unexpected twists, cinematic chiaroscuro lighting, high contrast, subtle iconic symbol, photorealistic, 8k.',
    coverPrompt: 'Create an intense 16:9 cinematic widescreen Facebook cover banner for "{PAGE_NAME}". Theme: compelling life drama, emotional confrontation, moody atmospheric lighting, cinematic storytelling composition, photorealistic, 8k resolution.',
    bioTemplate: '{PAGE_NAME} — Gripping life drama, shocking twists & raw human emotions.',
    descTemplate: 'Welcome to {PAGE_NAME}. Dive into captivating life dramas, unexpected plot twists, real-world confessions, and deep emotional turning points you cannot miss.',
  },
  {
    id: 'inspiring_story',
    name: '✨ Câu Chuyện Truyền Cảm Hứng (Inspiring Story)',
    desc: 'Ánh sáng rực rỡ, niềm hy vọng, vượt khó vươn lên và những giá trị sống tích cực.',
    avatarPrompt: 'Create a 1:1 square uplifting profile picture avatar for an inspirational storytelling page named "{PAGE_NAME}". Theme: hope, resilience, overcoming adversity, bright cinematic sunrise lighting, inspiring aesthetic emblem, photorealistic, 8k.',
    coverPrompt: 'Create an awe-inspiring 16:9 panoramic cinematic Facebook cover banner for "{PAGE_NAME}". Theme: journey of hope and triumph, breathtaking horizon, golden morning glow, cinematic storytelling, 8k resolution.',
    bioTemplate: '{PAGE_NAME} — Empowering stories of resilience, hope & triumphant journeys.',
    descTemplate: 'Welcome to {PAGE_NAME}. Fuel your daily inspiration with remarkable real-life stories of overcoming adversity, boundless hope, and human triumph.',
  },
  {
    id: 'history_mystery',
    name: '📜 Lịch Sử & Bí Ẩn Cổ Xưa (History)',
    desc: 'Tư liệu cổ kính, bóng tối điện ảnh, chi tiết huyền bí và không gian lưu trữ tài liệu.',
    avatarPrompt: 'Create a 1:1 square iconic profile picture avatar for a storytelling page named "{PAGE_NAME}". Theme: historical mysteries, lost archives, and forgotten secrets. Cinematic dramatic lighting, rich atmospheric textures, deep shadows, 8k resolution, minimalist emblem style, photorealistic.',
    coverPrompt: 'Create a breathtaking cinematic 16:9 widescreen Facebook cover banner for "{PAGE_NAME}". Theme: ancient historical archive, mysterious documents, dramatic storytelling mood, rich vintage textures, volumetric lighting, photorealistic masterpiece, 8k.',
    bioTemplate: '{PAGE_NAME} — Uncovering lost history, ancient secrets & forgotten empires.',
    descTemplate: 'Step into the past with {PAGE_NAME}. Explore legendary historical enigmas, ancient civilizations, secret archives, and dramatic chronicles of world history.',
  },
  {
    id: 'unsolved_cases',
    name: '🔍 Hồ Sơ Vụ Án & Ly Kỳ (Mystery Case)',
    desc: 'Không khí trinh thám, điều tra bí mật, ánh đèn neon mờ ảo, bóng đêm kịch tính.',
    avatarPrompt: 'Create a 1:1 square profile picture avatar for a mystery investigation page named "{PAGE_NAME}". Theme: unsolved cold cases, detective archives, dark noir aesthetics. High contrast, cinematic chiaroscuro lighting, subtle emblem symbol, photorealistic, 8k.',
    coverPrompt: 'Create an intense 16:9 cinematic widescreen Facebook cover banner for "{PAGE_NAME}". Theme: detective case files, investigative journalism, atmospheric fog, moody dramatic street lighting, photorealistic cinematic storytelling, 8k resolution.',
    bioTemplate: '{PAGE_NAME} — True crime files, mysterious cases & investigative deep dives.',
    descTemplate: 'Welcome to {PAGE_NAME}. Exploring eerie cold case files, forensic investigations, unsolved mysteries, and psychological deep dives from around the world.',
  },
  {
    id: 'modern_editorial',
    name: '⚡ Khám Phá & Đời Sống Hiện Đại',
    desc: 'Phong cách hiện đại, tương phản cao, góc nhìn báo chí và khám phá thế giới.',
    avatarPrompt: 'Create a 1:1 modern minimalist profile picture avatar for a storytelling media page named "{PAGE_NAME}". Bold visual identity, clean typography badge, striking contrast, sleek studio lighting, 8k resolution.',
    coverPrompt: 'Create an ultra-modern 16:9 documentary editorial cover banner for "{PAGE_NAME}". Dynamic composition, global perspectives, high-impact cinematic aesthetics, clean visual storytelling, 8k.',
    bioTemplate: '{PAGE_NAME} — Fresh perspectives, cultural trends & modern life insights.',
    descTemplate: 'Welcome to {PAGE_NAME}. Delivering fresh perspectives on contemporary society, cultural trends, and compelling visual stories that shape our modern world.',
  },
  {
    id: 'custom',
    name: '✍️ Tùy Biến Tự Do',
    desc: 'Tự nhập câu lệnh prompt và mô tả chi tiết theo phong cách riêng của bạn (100% English).',
    avatarPrompt: '',
    coverPrompt: '',
    bioTemplate: '{PAGE_NAME} — Daily stories, original highlights & meaningful moments.',
    descTemplate: 'Welcome to the official page of {PAGE_NAME}. Follow us for inspiring stories, original content, and daily community updates.',
  },
];

export default function PageBrandingMuse() {
  const navigate = useNavigate();
  const { pages, ztteam_fetchPagesFromDB, isLoading } = useZTTeamFacebookStore();
  const { ztteam_showToast, ztteam_showConfirm } = useUIStore();

  /** State Điều hướng Tabs chính */
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);

  /** Bộ lọc BM & Tìm kiếm */
  const [selectedBm, setSelectedBm] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'missing_only' | 'missing_cover' | 'missing_avatar' | 'missing_bio' | 'has_branding' | 'all'>('missing_only');

  /** Danh sách ID Page được chọn */
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);

  /** Cấu hình Tác Vụ Độc Lập (Có thể chọn riêng không bắt buộc đi kèm với avatar) */
  const [enableAvatar, setEnableAvatar] = useState<boolean>(true);
  const [enableCover, setEnableCover] = useState<boolean>(true);
  const [enableBioDesc, setEnableBioDesc] = useState<boolean>(true);

  /** Cấu hình Prompt Studio & Bio/Desc */
  const [selectedThemeId, setSelectedThemeId] = useState<string>('story_narrative');
  const [customAvatarPrompt, setCustomAvatarPrompt] = useState<string>(THEME_PRESETS[0].avatarPrompt);
  const [customCoverPrompt, setCustomCoverPrompt] = useState<string>(THEME_PRESETS[0].coverPrompt);
  const [customBioTemplate, setCustomBioTemplate] = useState<string>(THEME_PRESETS[0].bioTemplate || '');
  const [customDescTemplate, setCustomDescTemplate] = useState<string>(THEME_PRESETS[0].descTemplate || '');
  const [isSubmittingBioOnly, setIsSubmittingBioOnly] = useState<boolean>(false);
  const [includePageNameText, setIncludePageNameText] = useState<boolean>(true);
  const [autoApplyFacebook, setAutoApplyFacebook] = useState<boolean>(true);

  /** Trạng thái Hàng Đợi & Tiến Trình */
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [isSubmittingQueue, setIsSubmittingQueue] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activePreviewPage, setActivePreviewPage] = useState<any>(null);
  const [isApplyingFacebook, setIsApplyingFacebook] = useState<string | null>(null);

  /** Tải lại dữ liệu khi vào trang */
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await ztteam_fetchPagesFromDB();
      const res = await api.get('/facebook/pages/branding/queue-status');
      if (res.data?.success) {
        setQueueStatus(res.data);
      }
    } catch (e: any) {
      console.warn('Lỗi tải queue status:', e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
    /** Polling nhẹ trạng thái hàng đợi mỗi 10 giây nếu đang ở Tab 3 */
    const interval = setInterval(() => {
      api.get('/facebook/pages/branding/queue-status')
        .then(res => {
          if (res.data?.success) setQueueStatus(res.data);
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  /** Danh sách Business Manager duy nhất */
  const uniqueBusinesses = useMemo(() => {
    const bms = Array.from(new Set(pages.map(p => p.businessName).filter(Boolean)));
    return bms;
  }, [pages]);

  /** Danh sách Fanpage sau khi lọc */
  const filteredPages = useMemo(() => {
    return pages.filter(p => {
      if (p.isActive === false) return false;

      /** Lọc theo BM */
      if (selectedBm !== 'all' && p.businessName !== selectedBm) {
        return false;
      }

      /** Lọc theo Search */
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchId = (p.fb_page_id || p.id || '').includes(q);
        if (!matchName && !matchId) return false;
      }

      /** Lọc theo Trạng thái Nhận diện */
      const hasAvatar = !!p.brandingAvatarUrl;
      const hasCover = !!p.brandingCoverUrl;
      const hasBio = !!(p.brandingBio || (p as any).branding_bio);

      if (filterMode === 'missing_only') return !hasAvatar || !hasCover;
      if (filterMode === 'missing_cover') return !hasCover;
      if (filterMode === 'missing_avatar') return !hasAvatar;
      if (filterMode === 'missing_bio') return !hasBio;
      if (filterMode === 'has_branding') return hasAvatar && hasCover;

      return true;
    });
  }, [pages, selectedBm, searchQuery, filterMode]);

  /** Đổi Preset Chủ đề */
  const handleSelectThemePreset = (themeId: string) => {
    setSelectedThemeId(themeId);
    const preset = THEME_PRESETS.find(t => t.id === themeId);
    if (preset && themeId !== 'custom') {
      setCustomAvatarPrompt(preset.avatarPrompt);
      setCustomCoverPrompt(preset.coverPrompt);
      if (preset.bioTemplate) setCustomBioTemplate(preset.bioTemplate);
      if (preset.descTemplate) setCustomDescTemplate(preset.descTemplate);
    }
  };

  /** Xử lý Chọn tất cả các Page đang hiển thị */
  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredPages.map(p => p.id);
    const isAllSelected = allFilteredIds.every(id => selectedPageIds.includes(id));
    if (isAllSelected) {
      setSelectedPageIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedPageIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  /** Xử lý Chọn / Bỏ chọn 1 Page */
  const handleToggleSelectPage = (pageId: string) => {
    setSelectedPageIds(prev => 
      prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
    );
  };

  /** Danh sách Page thực tế được nhắm mục tiêu cho tác vụ */
  const targetPagesForExecution = useMemo(() => {
    // 1. Nếu người dùng đã tích chọn cụ thể ở Tab 1
    if (selectedPageIds.length > 0) {
      const selected = pages.filter(p => p.isActive !== false && (selectedPageIds.includes(p.id) || (p.fb_page_id && selectedPageIds.includes(p.fb_page_id)) || (p.internalId && selectedPageIds.includes(p.internalId))));
      if (selected.length > 0) return selected;
    }
    // 2. Nếu người dùng chỉ cập nhật Tiểu Sử & Mô Tả (không tạo ảnh):
    // Cho phép áp dụng cho TẤT CẢ các Page theo bộ lọc BM / Tìm kiếm (không bị lọc mất bởi thiếu avatar/cover)
    if (!enableAvatar && !enableCover && enableBioDesc) {
      return pages.filter(p => {
        if (p.isActive === false) return false;
        if (selectedBm !== 'all' && p.businessName !== selectedBm) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (p.name || '').toLowerCase().includes(q) || (p.fb_page_id || p.id || '').includes(q);
        }
        return true;
      });
    }
    // 3. Mặc định dùng filteredPages
    return filteredPages;
  }, [pages, selectedPageIds, filteredPages, enableAvatar, enableCover, enableBioDesc, selectedBm, searchQuery]);

  /** Đưa Fanpage đã chọn vào Hàng Đợi Muse */
  const handleQueueBrandingSubmit = async () => {
    const targetPages = targetPagesForExecution;

    if (targetPages.length === 0) {
      ztteam_showToast('Vui lòng chọn ít nhất 1 Fanpage để đưa vào hàng đợi', 'error');
      return;
    }

    const targetType: 'both' | 'avatar' | 'cover' = enableAvatar && enableCover ? 'both' : enableAvatar ? 'avatar' : 'cover';

    const confirm = await ztteam_showConfirm(
      'Xác nhận Đưa vào Hàng Đợi Muse',
      `Bạn chuẩn bị đưa ${targetPages.length} Fanpage vào hàng đợi tạo nhận diện bằng Muse.ai.\n\n` +
      `- Định dạng ảnh: ${targetType === 'both' ? 'Cả Avatar (1:1) và Ảnh bìa (16:9)' : targetType === 'avatar' ? 'Chỉ Avatar (1:1)' : 'Chỉ Ảnh bìa (16:9)'}\n` +
      `- Kèm Tiểu sử & Mô tả: ${enableBioDesc ? 'BẬT (100% English)' : 'TẮT'}\n` +
      `- Tự động cập nhật Facebook: ${autoApplyFacebook ? 'BẬT' : 'TẮT (Chỉ lưu trữ)'}\n\n` +
      `Tiến trình sẽ được xử lý tự động khi Worker Muse trên máy tính hoạt động. Bạn có muốn tiếp tục?`
    );

    if (!confirm) return;

    try {
      setIsSubmittingQueue(true);
      const res = await api.post('/facebook/pages/branding/bulk-queue', {
        scope: 'selected',
        pageIds: targetPages.map(p => p.fb_page_id || p.id),
        customAvatarPrompt: enableAvatar ? customAvatarPrompt : undefined,
        customCoverPrompt: enableCover ? customCoverPrompt : undefined,
        customBioTemplate: enableBioDesc ? customBioTemplate : undefined,
        customDescTemplate: enableBioDesc ? customDescTemplate : undefined,
        autoApplyBioDesc: enableBioDesc,
        theme: selectedThemeId,
        autoApplyFacebook,
        brandingType: targetType,
      });

      if (res.data?.success) {
        ztteam_showToast(res.data.message || `Đã đưa ${res.data.totalQueued} Fanpage vào hàng đợi Muse!`, 'success');
        setActiveTab(3); // Chuyển sang Tab Hàng Đợi để theo dõi
        await refreshData();
      } else {
        ztteam_showToast(res.data?.message || 'Không có Fanpage nào được thêm vào hàng đợi', 'info');
      }
    } catch (err: any) {
      ztteam_showToast(err.response?.data?.message || err.message || 'Lỗi khi gửi vào hàng đợi', 'error');
    } finally {
      setIsSubmittingQueue(false);
    }
  };

  /** Cập nhật riêng Mô tả & Tiểu sử cho các Fanpage đã chọn qua Meta Graph API (100% English, Không cần vẽ ảnh) */
  const handleBulkApplyDescriptionsOnly = async () => {
    const targetPages = targetPagesForExecution;

    if (targetPages.length === 0) {
      ztteam_showToast('Vui lòng chọn ít nhất 1 Fanpage để cập nhật mô tả', 'error');
      return;
    }

    if (!customBioTemplate.trim() && !customDescTemplate.trim()) {
      ztteam_showToast('Vui lòng nhập mẫu Tiểu sử (Bio) hoặc Mô tả (Description)', 'error');
      return;
    }

    const confirm = await ztteam_showConfirm(
      'Cập Nhật Mô Tả & Tiểu Sử (100% English) Lên Facebook',
      `Bạn chuẩn bị gửi lệnh cập nhật Mô tả & Tiểu sử trực tiếp qua Meta Graph API cho ${targetPages.length} Fanpage.\n\n` +
      `- Chủ đề: ${THEME_PRESETS.find(t => t.id === selectedThemeId)?.name || selectedThemeId}\n` +
      `- Giữ nguyên toàn bộ Avatar và Ảnh bìa hiện tại (Không cần tạo ảnh).\n` +
      `- Ngôn ngữ: 100% English chuẩn quốc tế.\n\n` +
      `Bạn có muốn tiếp tục áp dụng ngay?`
    );

    if (!confirm) return;

    try {
      setIsSubmittingBioOnly(true);
      const res = await api.post('/facebook/pages/branding/bulk-apply-descriptions', {
        pageIds: targetPages.map(p => p.fb_page_id || p.id),
        bioTemplate: customBioTemplate,
        descTemplate: customDescTemplate,
        theme: selectedThemeId,
      });

      if (res.data?.success) {
        ztteam_showToast(res.data.message || `Đã cập nhật Mô tả cho ${targetPages.length} Fanpage thành công!`, 'success');
        await refreshData();
      } else {
        ztteam_showToast(res.data?.message || 'Không thể cập nhật mô tả lên Facebook', 'error');
      }
    } catch (err: any) {
      ztteam_showToast(err.response?.data?.message || err.message || 'Lỗi khi cập nhật mô tả lên Facebook', 'error');
    } finally {
      setIsSubmittingBioOnly(false);
    }
  };

  /** Áp dụng Ảnh & Bio lên Facebook thủ công */
  const handleApplySinglePageFacebook = async (page: any) => {
    const hasImage = !!(page.brandingAvatarUrl || page.brandingCoverUrl);
    const hasBio = !!(page.brandingBio || (page as any).branding_bio);

    const descMsg = hasImage && hasBio
      ? `Hệ thống sẽ cập nhật Avatar, Ảnh bìa và Tiểu sử/Mô tả lên Fanpage "${page.name}".`
      : hasImage
      ? `Hệ thống sẽ cập nhật Avatar và Ảnh bìa lên Fanpage "${page.name}".`
      : `Hệ thống sẽ cập nhật Tiểu sử & Mô tả lên Fanpage "${page.name}".`;

    const confirm = await ztteam_showConfirm(
      'Áp Dụng Lên Facebook',
      `${descMsg} Quá trình này dùng cờ ẩn để không spam bảng tin. Bạn có muốn áp dụng?`
    );
    if (!confirm) return;

    try {
      setIsApplyingFacebook(page.id);
      const res = await api.post(`/facebook/pages/${page.id}/branding/apply`, {
        avatarUrl: page.brandingAvatarUrl || undefined,
        coverUrl: page.brandingCoverUrl || undefined,
        bio: page.brandingBio || (page as any).branding_bio || undefined,
        description: page.brandingDescription || (page as any).branding_description || undefined,
      });
      if (res.data?.success) {
        ztteam_showToast(res.data.message || `Đã cập nhật nhận diện cho Fanpage "${page.name}" thành công!`, 'success');
        await refreshData();
      }
    } catch (err: any) {
      ztteam_showToast(err.response?.data?.message || err.message || 'Lỗi khi gắn lên Facebook', 'error');
    } finally {
      setIsApplyingFacebook(null);
    }
  };

  /** Reset hoặc Hủy bỏ Job */
  const handleResetJob = async (pageId: string) => {
    try {
      await api.post(`/facebook/pages/branding/${pageId}/reset`);
      ztteam_showToast('Đã đặt lại trạng thái nhận diện cho Page', 'success');
      await refreshData();
    } catch (err: any) {
      ztteam_showToast(err.message, 'error');
    }
  };

  /** Giải phóng các job bị kẹt (PROCESSING hoặc FAILED) quay về PENDING */
  const handleResetStuckJobs = async () => {
    try {
      const res = await api.post('/facebook/pages/branding/queue-reset', { resetAll: false });
      ztteam_showToast(res.data?.message || 'Đã giải phóng các job bị kẹt quay lại hàng đợi', 'success');
      await refreshData();
    } catch (err: any) {
      ztteam_showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  /** Hủy bỏ toàn bộ hàng đợi Branding */
  const handleClearAllQueue = async () => {
    const confirm = await ztteam_showConfirm(
      'Hủy toàn bộ hàng đợi',
      'Bạn có chắc chắn muốn hủy và xóa toàn bộ Fanpage đang chờ vẽ khỏi hàng đợi?'
    );
    if (!confirm) return;

    try {
      const res = await api.post('/facebook/pages/branding/queue-reset', { resetAll: true });
      ztteam_showToast(res.data?.message || 'Đã làm sạch toàn bộ hàng đợi', 'success');
      await refreshData();
    } catch (err: any) {
      ztteam_showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  /** Thống kê nhanh */
  const stats = useMemo(() => {
    const total = pages.filter(p => p.isActive !== false).length;
    const hasAvatar = pages.filter(p => p.isActive !== false && p.brandingAvatarUrl).length;
    const hasCover = pages.filter(p => p.isActive !== false && p.brandingCoverUrl).length;
    const hasBio = pages.filter(p => p.isActive !== false && (p.brandingBio || (p as any).branding_bio)).length;
    const missingBio = pages.filter(p => p.isActive !== false && !(p.brandingBio || (p as any).branding_bio)).length;
    const missingAny = pages.filter(p => p.isActive !== false && (!p.brandingAvatarUrl || !p.brandingCoverUrl)).length;
    return { total, hasAvatar, hasCover, hasBio, missingBio, missingAny };
  }, [pages]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/** HEADER CHÍNH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-fb-surface-hover/50">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <span className="material-symbols-outlined text-2xl">palette</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Tạo Ảnh Bìa & Avatar Theo Chủ Đề (Muse.ai)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                MUSE RPA
              </span>
            </div>
            <p className="text-xs text-fb-text-muted mt-1">
              Hệ thống tự động hóa tạo nhận diện thương hiệu chuẩn điện ảnh theo từng Business Manager (BM), bám sát chủ đề Story và chèn tên Fanpage nghệ thuật.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="px-3 py-2 bg-fb-surface border border-fb-surface-hover/70 hover:bg-fb-surface-hover text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Tải lại dữ liệu"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}>
              refresh
            </span>
            <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
          </button>

          <button
            onClick={() => navigate('/facebook')}
            className="px-4 py-2 bg-fb-surface-hover hover:bg-fb-surface-hover/80 text-fb-text font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Quay lại Fanpage</span>
          </button>
        </div>
      </div>

      {/** THẺ KPI THỐNG KÊ NHẬN DIỆN */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-fb-surface p-4 rounded-2xl border border-fb-surface-hover/50 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-fb-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Tổng Fanpage</span>
            <span className="material-symbols-outlined text-base text-slate-400">flag</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-400">Đang hoạt động trên hệ thống</div>
        </div>

        <div className="bg-fb-surface p-4 rounded-2xl border border-fb-surface-hover/50 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Đã Có Avatar</span>
            <span className="material-symbols-outlined text-base text-emerald-400">account_circle</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.hasAvatar}</div>
          <div className="text-[11px] text-slate-400">Avatar thương hiệu chuẩn 1:1</div>
        </div>

        <div className="bg-fb-surface p-4 rounded-2xl border border-fb-surface-hover/50 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
            <span>Đã Có Ảnh Bìa</span>
            <span className="material-symbols-outlined text-base text-teal-400">panorama</span>
          </div>
          <div className="text-2xl font-black text-teal-400">{stats.hasCover}</div>
          <div className="text-[11px] text-slate-400">Cover banner 16:9 sắc nét</div>
        </div>

        <div className="bg-fb-surface p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>Chưa Có Nhận Diện</span>
            <span className="material-symbols-outlined text-base text-amber-400">warning</span>
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.missingAny}</div>
          <div className="text-[11px] text-amber-300/80 font-medium">Thiếu Avatar hoặc Ảnh bìa</div>
        </div>
      </div>

      {/** THANH CHUYỂN TABS CHUẨN (GIỐNG FACEBOOK PAGE SETTINGS) */}
      <div className="flex border-b border-fb-surface-hover/50 space-x-1 sm:space-x-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab(1)}
          className={`px-5 py-3 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 1
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 shadow-xs'
              : 'border-transparent text-fb-text-muted hover:text-fb-text hover:bg-fb-surface-hover/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">checklist</span>
          <span>1. Chọn BM & Fanpage</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            activeTab === 1 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-fb-surface-hover text-slate-400 border-white/5'
          }`}>
            {filteredPages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`px-5 py-3 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 2
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 shadow-xs'
              : 'border-transparent text-fb-text-muted hover:text-fb-text hover:bg-fb-surface-hover/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">tune</span>
          <span>2. Tùy Chỉnh Prompt & Chủ Đề</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
            {THEME_PRESETS.find(t => t.id === selectedThemeId)?.name.slice(0, 10)}...
          </span>
        </button>

        <button
          onClick={() => setActiveTab(3)}
          className={`px-5 py-3 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 3
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 shadow-xs'
              : 'border-transparent text-fb-text-muted hover:text-fb-text hover:bg-fb-surface-hover/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">view_carousel</span>
          <span>3. Hàng Đợi & Xem Trước Ảnh</span>
          {queueStatus?.queue?.totalActiveJobs > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
              {queueStatus.queue.totalActiveJobs} Đang chạy
            </span>
          )}
        </button>
      </div>

      {/** =========================================================================
       * TAB 1: CHỌN BM & BỘ LỌC FANPAGE
       * ========================================================================= */}
      {activeTab === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/** Khung Lọc: BM + Search + Tình trạng */}
          <div className="bg-fb-surface rounded-2xl shadow-lg border border-fb-surface-hover/50 p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/** Chọn BM */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="block text-xs font-bold text-fb-text flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-blue-400">corporate_fare</span>
                  <span>Chọn Business Manager (BM):</span>
                </label>
                <CustomDropdown
                  value={selectedBm}
                  onChange={val => setSelectedBm(val)}
                  options={[
                    { value: 'all', label: `🏢 Tất cả Doanh nghiệp (${stats.total} Page)` },
                    ...uniqueBusinesses.map(bm => ({
                      value: bm as string,
                      label: `🏢 ${bm} (${pages.filter(p => p.businessName === bm && p.isActive !== false).length} Page)`
                    }))
                  ]}
                  className="w-full"
                />
              </div>

              {/** Ô Tìm Kiếm */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-fb-text-muted flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">search</span>
                  <span>Tìm kiếm Fanpage:</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Nhập tên Fanpage hoặc ID..."
                    className="w-full px-3.5 py-2 pl-9 bg-fb-surface-hover/30 border border-fb-surface-hover/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-sm">
                    search
                  </span>
                </div>
              </div>

              {/** Nút Thao Tác Nhanh */}
              <div className="md:col-span-3 flex items-center gap-2">
                <button
                  onClick={handleToggleSelectAll}
                  className="flex-1 py-2 px-3 bg-fb-surface-hover/50 hover:bg-fb-surface-hover border border-fb-surface-hover/70 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  {filteredPages.length > 0 && filteredPages.every(p => selectedPageIds.includes(p.id))
                    ? 'Bỏ chọn tất cả'
                    : `Chọn tất cả (${filteredPages.length})`}
                </button>
              </div>
            </div>

            {/** Bộ Lọc Trạng Thái Nhận Diện (Pill Buttons) */}
            <div className="pt-3 border-t border-fb-surface-hover/40 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-fb-text-muted mr-1">Bộ lọc nhanh:</span>

              <button
                type="button"
                onClick={() => setFilterMode('missing_only')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterMode === 'missing_only'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-xs'
                    : 'bg-fb-surface-hover/20 border-slate-700/60 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">warning</span>
                <span>Chưa có ảnh bìa hoặc avatar</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200">
                  {stats.missingAny}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('missing_cover')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterMode === 'missing_cover'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-xs'
                    : 'bg-fb-surface-hover/20 border-slate-700/60 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span>Chỉ thiếu Ảnh bìa</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {stats.total - stats.hasCover}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('missing_avatar')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterMode === 'missing_avatar'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs'
                    : 'bg-fb-surface-hover/20 border-slate-700/60 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span>Chỉ thiếu Avatar</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {stats.total - stats.hasAvatar}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('missing_bio')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterMode === 'missing_bio'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-xs'
                    : 'bg-fb-surface-hover/20 border-slate-700/60 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">badge</span>
                <span>Chưa có Bio / Mô tả</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300 font-mono">
                  {stats.missingBio}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs'
                    : 'bg-fb-surface-hover/20 border-slate-700/60 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span>Tất cả Fanpage ({stats.total})</span>
              </button>
            </div>
          </div>

          {/** Bảng Danh Sách Fanpage */}
          <div className="bg-fb-surface rounded-2xl shadow-lg border border-fb-surface-hover/50 overflow-hidden">
            <div className="p-3.5 bg-slate-800/60 border-b border-fb-surface-hover/60 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filteredPages.length > 0 && filteredPages.every(p => selectedPageIds.includes(p.id))}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <span className="font-bold">Danh sách Fanpage ({filteredPages.length} Page phù hợp)</span>
              </div>
              <div className="text-emerald-400 font-mono font-bold text-xs">
                Đã chọn: {selectedPageIds.length} Page
              </div>
            </div>

            <div className="divide-y divide-fb-surface-hover/40 max-h-[550px] overflow-y-auto">
              {filteredPages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-1">
                  <span className="material-symbols-outlined text-3xl text-slate-500">filter_none</span>
                  <div>Không tìm thấy Fanpage nào phù hợp với bộ lọc hiện tại.</div>
                </div>
              ) : (
                filteredPages.map(page => {
                  const isSelected = selectedPageIds.includes(page.id);
                  const hasAvatar = !!page.brandingAvatarUrl;
                  const hasCover = !!page.brandingCoverUrl;
                  const pageBio = page.brandingBio || (page as any).branding_bio;

                  return (
                    <div
                      key={page.id}
                      onClick={() => handleToggleSelectPage(page.id)}
                      className={`p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-500/10 hover:bg-emerald-500/15' : 'hover:bg-fb-surface-hover/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectPage(page.id)}
                          onClick={e => e.stopPropagation()}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer shrink-0"
                        />

                        {/** Avatar Thumbnail */}
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 shrink-0">
                          {page.avatar ? (
                            <img src={page.avatar} alt={page.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
                              {page.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          {hasAvatar && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900" title="Đã có Avatar tùy chỉnh" />
                          )}
                        </div>

                        {/** Thông tin Page */}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-xs sm:text-sm truncate flex items-center gap-2">
                            <span>{page.name}</span>
                            {page.businessName && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-normal shrink-0">
                                {page.businessName}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">ID: {page.fb_page_id || page.id}</span>
                            <span>•</span>
                            <span className="text-emerald-400/90">{page.primarySourceWeb || 't6.goxo.us'}</span>
                          </div>
                        </div>
                      </div>

                      {/** Cột Trạng Thái Nhận Diện */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {/** Trạng thái Avatar */}
                        {hasAvatar ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            Avatar 1:1
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span className="material-symbols-outlined text-[12px]">hide_image</span>
                            Thiếu Avatar
                          </span>
                        )}

                        {/** Trạng thái Cover */}
                        {hasCover ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            Ảnh bìa 16:9
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span className="material-symbols-outlined text-[12px]">panorama</span>
                            Thiếu Cover
                          </span>
                        )}

                        {/** Trạng thái Bio */}
                        {pageBio ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 max-w-[110px] truncate"
                            title={`Bio: "${pageBio}"`}
                          >
                            <span className="material-symbols-outlined text-[12px]">badge</span>
                            Bio OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700/60">
                            Thiếu Bio
                          </span>
                        )}

                        {/** Nút Chuyển nhanh qua tab cấu hình */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPageIds([page.id]);
                            setActiveTab(2);
                          }}
                          className="p-1.5 hover:bg-fb-surface-hover rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="Cấu hình Prompt cho Page này"
                        >
                          <span className="material-symbols-outlined text-sm">edit_note</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/** Footer Bảng */}
            <div className="p-3 bg-slate-900/40 border-t border-fb-surface-hover/50 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Hiển thị <b className="text-white">{filteredPages.length}</b> Fanpage
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEnableAvatar(false);
                    setEnableCover(false);
                    setEnableBioDesc(true);
                    setActiveTab(2);
                  }}
                  className="px-3.5 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Chuyển sang cấu hình và cập nhật riêng Tiểu sử & Mô tả (100% English, không tạo ảnh)"
                >
                  <span className="material-symbols-outlined text-sm">badge</span>
                  <span>Chỉ Cập Nhật Bio & Mô Tả</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>Tiếp tục sang bước 2: Tùy chỉnh Nhận diện</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/** =========================================================================
       * TAB 2: STUDIO TÙY CHỈNH PROMPT & CHỦ ĐỀ
       * ========================================================================= */}
      {activeTab === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/** Khung Chọn Tác Vụ Độc Lập: Avatar, Cover, Bio & Mô Tả */}
          <div className="bg-fb-surface rounded-2xl shadow-lg border border-fb-surface-hover/50 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-fb-surface-hover/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-lg">checklist</span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Chọn Tác Vụ Cần Thực Hiện (Có Thể Chọn Riêng Biệt)
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Tích chọn các hạng mục bạn muốn thực hiện — có thể chọn riêng Bio/Mô tả mà không bắt buộc tạo Avatar
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/** Card 1: Avatar */}
              <label
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  enableAvatar
                    ? 'bg-emerald-500/15 border-emerald-500 shadow-sm'
                    : 'bg-slate-900/40 border-slate-700/50 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={enableAvatar}
                    onChange={e => setEnableAvatar(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <span className="material-symbols-outlined text-sm text-emerald-400">account_circle</span>
                    <span>Tạo Avatar (1:1)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-snug">
                    Vẽ ảnh đại diện vuông 1024x1024 qua Muse.ai
                  </div>
                </div>
              </label>

              {/** Card 2: Cover */}
              <label
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  enableCover
                    ? 'bg-teal-500/15 border-teal-500 shadow-sm'
                    : 'bg-slate-900/40 border-slate-700/50 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={enableCover}
                    onChange={e => setEnableCover(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <span className="material-symbols-outlined text-sm text-teal-400">panorama</span>
                    <span>Tạo Ảnh Bìa (16:9)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-snug">
                    Vẽ banner phong cảnh điện ảnh 16:9 qua Muse.ai
                  </div>
                </div>
              </label>

              {/** Card 3: Bio & Description */}
              <label
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  enableBioDesc
                    ? 'bg-cyan-500/15 border-cyan-500 shadow-sm ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/40 border-slate-700/50 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={enableBioDesc}
                    onChange={e => setEnableBioDesc(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-300">
                    <span className="material-symbols-outlined text-sm text-cyan-400">badge</span>
                    <span>Tiểu Sử & Mô Tả (100% English)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-snug">
                    Cập nhật Bio & About qua Meta Graph API (không cần vẽ ảnh)
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/** Cột Trái: Chọn Preset & Tùy chỉnh Prompt */}
            <div className="lg:col-span-8 space-y-5">
              {/** Khối 1: Chọn Preset Chủ đề */}
              <div className="bg-fb-surface rounded-2xl shadow-lg border border-fb-surface-hover/50 p-5 space-y-3">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">style</span>
                  <span>1. Chọn Phong Cách & Chủ Đề Mẫu</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEME_PRESETS.map(preset => {
                    const isSelected = selectedThemeId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectThemePreset(preset.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-md shadow-emerald-500/10'
                            : 'bg-fb-surface-hover/20 border-slate-700/60 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{preset.name}</span>
                          {isSelected && <span className="material-symbols-outlined text-sm text-emerald-400">check</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {preset.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/** Khối 2: Prompt Avatar 1:1 */}
              <div className={`bg-fb-surface rounded-2xl shadow-lg border p-5 space-y-3 transition-all ${
                enableAvatar ? 'border-fb-surface-hover/50' : 'border-slate-800 opacity-60 bg-slate-900/20'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">account_circle</span>
                    <span>2. Prompt Ảnh Đại Diện (Avatar 1:1)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {!enableAvatar && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        ĐÃ TẮT (Không tạo Avatar)
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400">Vuông 1024x1024</span>
                  </div>
                </div>
                {enableAvatar ? (
                  <>
                    <textarea
                      rows={4}
                      value={customAvatarPrompt}
                      onChange={e => setCustomAvatarPrompt(e.target.value)}
                      placeholder="Enter 1:1 square prompt in English for Avatar..."
                      className="w-full p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span>Biến mẫu:</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                        {'{PAGE_NAME}'}
                      </span>
                      <span>= Tên Fanpage;</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 font-mono">
                        {'{THEME}'}
                      </span>
                      <span>= Chủ đề</span>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Đang tắt tạo Avatar cho đợt này. Page sẽ giữ nguyên ảnh đại diện hiện tại.</span>
                    <button
                      type="button"
                      onClick={() => setEnableAvatar(true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 font-bold text-[11px] cursor-pointer"
                    >
                      Bật lại
                    </button>
                  </div>
                )}
              </div>

              {/** Khối 3: Prompt Cover 16:9 */}
              <div className={`bg-fb-surface rounded-2xl shadow-lg border p-5 space-y-3 transition-all ${
                enableCover ? 'border-fb-surface-hover/50' : 'border-slate-800 opacity-60 bg-slate-900/20'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">panorama</span>
                    <span>3. Prompt Ảnh Bìa Fanpage (Cover 16:9)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {!enableCover && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        ĐÃ TẮT (Không tạo Cover)
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400">Cinematic Banner 16:9</span>
                  </div>
                </div>
                {enableCover ? (
                  <>
                    <textarea
                      rows={4}
                      value={customCoverPrompt}
                      onChange={e => setCustomCoverPrompt(e.target.value)}
                      placeholder="Enter 16:9 widescreen prompt in English for Cover..."
                      className="w-full p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono leading-relaxed"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span>Biến mẫu:</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                        {'{PAGE_NAME}'}
                      </span>
                      <span>= Tên Fanpage;</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 font-mono">
                        {'{THEME}'}
                      </span>
                      <span>= Chủ đề</span>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Đang tắt tạo Ảnh bìa cho đợt này. Page sẽ giữ nguyên ảnh bìa hiện tại.</span>
                    <button
                      type="button"
                      onClick={() => setEnableCover(true)}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-400 hover:bg-teal-500/25 border border-teal-500/30 font-bold text-[11px] cursor-pointer"
                    >
                      Bật lại
                    </button>
                  </div>
                )}
              </div>

              {/** Khối 4: Tiểu Sử & Mô Tả Fanpage (Bio / Description) - 100% ENGLISH */}
              <div className={`bg-fb-surface rounded-2xl shadow-lg border p-5 space-y-4 transition-all ${
                enableBioDesc
                  ? 'border-cyan-500/50 shadow-cyan-500/5 ring-1 ring-cyan-500/20'
                  : 'border-slate-800 opacity-60 bg-slate-900/20'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-fb-surface-hover/40">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-cyan-400">badge</span>
                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      4. Tiểu Sử & Mô Tả Fanpage (100% English)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                      100% ENGLISH
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      META GRAPH API
                    </span>
                  </div>
                </div>

                {enableBioDesc ? (
                  <div className="space-y-3">
                    {/** Ô nhập Bio ngắn */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1">
                          <span>Tiểu sử ngắn (Bio Mobile - 100% English):</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Tối đa 101 ký tự • Dưới tên Page</span>
                      </div>
                      <input
                        type="text"
                        maxLength={101}
                        value={customBioTemplate}
                        onChange={e => setCustomBioTemplate(e.target.value)}
                        placeholder="{PAGE_NAME} — Heartfelt human stories & inspiring life journeys."
                        className="w-full p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Biến: {'{PAGE_NAME}'} sẽ được thay bằng tên Page khi gửi lên Facebook</span>
                        <span className={customBioTemplate.length > 101 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {customBioTemplate.length}/101 ký tự
                        </span>
                      </div>
                    </div>

                    {/** Ô nhập Mô tả chi tiết */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1">
                          <span>Mô tả chi tiết (About / Description - 100% English):</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Giới thiệu sứ mệnh & nội dung Page</span>
                      </div>
                      <textarea
                        rows={3}
                        value={customDescTemplate}
                        onChange={e => setCustomDescTemplate(e.target.value)}
                        placeholder="Welcome to {PAGE_NAME}. Discover emotional life stories, heartwarming human experiences..."
                        className="w-full p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-normal"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <span>Biến tự động điền:</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                        {'{PAGE_NAME}'}
                      </span>
                      <span>= Tên Page;</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 font-mono">
                        {'{THEME}'}
                      </span>
                      <span>= Chủ đề</span>
                    </div>

                    {/** Nút Thao Tác Trực Tiếp Cập Nhật Mô Tả & Bio */}
                    <div className="pt-3 border-t border-fb-surface-hover/40 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-400">
                        Áp dụng cho <b className="text-cyan-300 font-bold">{targetPagesForExecution.length}</b> Fanpage (Meta Graph API)
                      </div>
                      <button
                        type="button"
                        onClick={handleBulkApplyDescriptionsOnly}
                        disabled={isSubmittingBioOnly || targetPagesForExecution.length === 0}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 via-fb-blue to-blue-600 hover:opacity-90 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingBioOnly ? (
                          <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                        ) : (
                          <span className="material-symbols-outlined text-sm">send</span>
                        )}
                        <span>
                          {isSubmittingBioOnly
                            ? 'Đang gửi lên Facebook...'
                            : `⚡ Cập Nhật Tiểu Sử & Mô Tả Ngay (${targetPagesForExecution.length} Page)`}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Đang tắt cập nhật Bio & Mô tả cho đợt này. Page sẽ giữ nguyên thông tin hiện có.</span>
                    <button
                      type="button"
                      onClick={() => setEnableBioDesc(true)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 border border-cyan-500/30 font-bold text-[11px] cursor-pointer"
                    >
                      Bật lại
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/** Cột Phải: Cấu hình Thực thi & Nút Hành Động */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-fb-surface rounded-2xl shadow-lg border border-fb-surface-hover/50 p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-fb-surface-hover/40">
                  <span className="material-symbols-outlined text-base text-emerald-400">tune</span>
                  <span>Tùy Chọn Thực Thi</span>
                </h3>

                {/** Tóm tắt các tác vụ đang chọn */}
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300">Tác vụ đang chọn:</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">1. Avatar 1:1:</span>
                      {enableAvatar ? (
                        <span className="text-emerald-400 font-bold">BẬT (Muse.ai)</span>
                      ) : (
                        <span className="text-slate-500">TẮT</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">2. Ảnh bìa 16:9:</span>
                      {enableCover ? (
                        <span className="text-teal-400 font-bold">BẬT (Muse.ai)</span>
                      ) : (
                        <span className="text-slate-500">TẮT</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">3. Bio & Mô tả:</span>
                      {enableBioDesc ? (
                        <span className="text-cyan-400 font-bold">BẬT (Meta API)</span>
                      ) : (
                        <span className="text-slate-500">TẮT</span>
                      )}
                    </div>
                  </div>
                </div>

                {/** Switch 1: Tự động cập nhật ảnh lên Facebook khi vẽ xong */}
                {(enableAvatar || enableCover) && (
                  <div className="pt-1 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <div className="text-xs font-bold text-white">Tự động gắn lên Facebook</div>
                      <div className="text-[10px] text-slate-400">Gắn ảnh ngay sau khi Muse render xong qua Meta API (cờ ẩn).</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoApplyFacebook(!autoApplyFacebook)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors shrink-0 cursor-pointer ${
                        autoApplyFacebook ? 'bg-emerald-500' : 'bg-black/30 shadow-inner border border-white/5'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoApplyFacebook ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                )}

                {/** Switch 2: Chèn tên Fanpage vào Artwork */}
                {(enableAvatar || enableCover) && (
                  <div className="pt-1 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <div className="text-xs font-bold text-white">Chèn Tên Typography</div>
                      <div className="text-[10px] text-slate-400">Yêu cầu Muse vẽ tên Fanpage dạng chữ nổi bật vào ảnh.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludePageNameText(!includePageNameText)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors shrink-0 cursor-pointer ${
                        includePageNameText ? 'bg-emerald-500' : 'bg-black/30 shadow-inner border border-white/5'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${includePageNameText ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                )}

                {/** Tóm tắt phạm vi */}
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5 text-xs text-emerald-300">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>Phạm vi áp dụng:</span>
                  </div>
                  <div>
                    {selectedPageIds.length > 0
                      ? `Đang chọn ${selectedPageIds.length} Fanpage cụ thể.`
                      : `Áp dụng cho ${targetPagesForExecution.length} Fanpage theo bộ lọc hiện tại.`}
                  </div>
                </div>

                {/** Nút Bắt Đầu Thực Thi Chính */}
                {(!enableAvatar && !enableCover && !enableBioDesc) ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center font-bold">
                    Vui lòng chọn ít nhất 1 tác vụ (Avatar, Ảnh Bìa hoặc Tiểu sử & Mô tả)
                  </div>
                ) : (!enableAvatar && !enableCover && enableBioDesc) ? (
                  /** Chỉ cập nhật Bio & Mô tả: Nút chạy trực tiếp qua Meta API không cần qua hàng đợi Muse */
                  <button
                    type="button"
                    onClick={handleBulkApplyDescriptionsOnly}
                    disabled={isSubmittingBioOnly || targetPagesForExecution.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 via-fb-blue to-blue-600 hover:opacity-90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingBioOnly ? (
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">send</span>
                    )}
                    <span>
                      {isSubmittingBioOnly
                        ? 'Đang cập nhật lên Facebook...'
                        : `⚡ Cập Nhật Tiểu Sử & Mô Tả Cho ${targetPagesForExecution.length} Page (Meta API)`}
                    </span>
                  </button>
                ) : (
                  /** Có tạo Avatar hoặc Cover: Nút đưa vào hàng đợi Muse */
                  <button
                    type="button"
                    onClick={handleQueueBrandingSubmit}
                    disabled={isSubmittingQueue || targetPagesForExecution.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingQueue ? (
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    )}
                    <span>
                      {isSubmittingQueue
                        ? 'Đang gửi vào hàng đợi...'
                        : `Đưa ${targetPagesForExecution.length} Page Vào Hàng Đợi Muse ${enableBioDesc ? '(& Cập nhật Bio)' : ''}`}
                    </span>
                  </button>
                )}

                {/** Nút Cập nhật riêng Mô tả & Tiểu sử trực tiếp qua Meta API (luôn có sẵn) */}
                <div className="pt-2 border-t border-fb-surface-hover/40 space-y-2">
                  <div className="text-[11px] text-slate-400">
                    Cập nhật nhanh Tiểu sử & Mô tả (100% English) qua Meta Graph API:
                  </div>
                  <button
                    type="button"
                    onClick={handleBulkApplyDescriptionsOnly}
                    disabled={isSubmittingBioOnly || targetPagesForExecution.length === 0}
                    className="w-full py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingBioOnly ? (
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">badge</span>
                    )}
                    <span>
                      {isSubmittingBioOnly
                        ? 'Đang cập nhật lên Facebook...'
                        : `⚡ Cập Nhật Riêng Mô Tả & Bio (${targetPagesForExecution.length} Page)`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/** =========================================================================
       * TAB 3: HÀNG ĐỢI & THƯ VIỆN ẢNH ĐÃ TẠO (LIVE STATUS & MOCKUP)
       * ========================================================================= */}
      {activeTab === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/** Khung Trạng Thái Worker & Hàng Đợi */}
          <div className="bg-fb-surface rounded-2xl shadow-lg border border-fb-surface-hover/50 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-fb-surface-hover/40">
              <div className="flex items-center gap-2.5">
                <span className={`p-2 rounded-xl border ${
                  queueStatus?.worker?.online
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  <span className="material-symbols-outlined text-lg">smart_toy</span>
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Trạng Thái Muse Worker (Chrome RPA)</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Worker chạy trên máy tính kết nối cổng Chrome Remote Debugging 9245.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {queueStatus?.worker?.online ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>🟢 Worker Trực Tuyến ({queueStatus.worker.workerName || 'Port 9245'})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>🔴 Worker Chưa Kết Nối (Offline)</span>
                  </span>
                )}
              </div>
            </div>

            {/** Hướng dẫn kích hoạt Worker khi Offline */}
            {!queueStatus?.worker?.online && (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>Hướng dẫn kích hoạt Muse Worker để vẽ ảnh Fanpage:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1">
                      <span>Bước 1: Mở Chrome Debugging</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Chạy file <code className="text-white bg-slate-800 px-1 py-0.5 rounded font-mono">start_chrome_branding_muse.bat</code> và đăng nhập tài khoản Muse.ai trên trình duyệt vừa mở.
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-1">
                    <div className="font-bold text-teal-400 flex items-center gap-1">
                      <span>Bước 2: Bật Worker Vẽ Ảnh</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Chạy file <code className="text-white bg-slate-800 px-1 py-0.5 rounded font-mono">start_muse_branding_worker.bat</code>, worker sẽ tự động kết nối và vẽ tuần tự các page trong hàng đợi.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/** Thống kê chi tiết Queue */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/60 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Chờ xử lý (Pending)</div>
                <div className="text-xl font-bold text-amber-400 mt-0.5">
                  {queueStatus?.queue?.pending || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/60 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Đang vẽ (Processing)</div>
                <div className="text-xl font-bold text-cyan-400 mt-0.5">
                  {queueStatus?.queue?.processing || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/60 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Đã hoàn thành</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">
                  {queueStatus?.queue?.completed || 0}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/60 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Lỗi (Failed)</div>
                <div className="text-xl font-bold text-rose-400 mt-0.5">
                  {queueStatus?.queue?.failed || 0}
                </div>
              </div>
            </div>

            {/** Thanh Nút Điều Khiển Hàng Đợi */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-fb-surface-hover/30">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-slate-500">sync_saved_locally</span>
                <span>Tự động cập nhật mỗi 10 giây</span>
              </div>

              <div className="flex items-center gap-2">
                {((queueStatus?.queue?.processing || 0) > 0 || (queueStatus?.queue?.failed || 0) > 0) && (
                  <button
                    type="button"
                    onClick={handleResetStuckJobs}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Đưa các Page đang bị kẹt hoặc lỗi quay lại danh sách chờ"
                  >
                    <span className="material-symbols-outlined text-sm">lock_open</span>
                    <span>Giải phóng Job kẹt ({((queueStatus?.queue?.processing || 0) + (queueStatus?.queue?.failed || 0))} Page)</span>
                  </button>
                )}

                {(queueStatus?.queue?.totalActiveJobs || 0) > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllQueue}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Xóa toàn bộ Fanpage đang chờ vẽ khỏi hàng đợi"
                  >
                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                    <span>Hủy hàng đợi</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className="px-3 py-1.5 rounded-xl bg-fb-surface-hover hover:bg-fb-surface-hover/80 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}>
                    refresh
                  </span>
                  <span>Làm mới</span>
                </button>
              </div>
            </div>
          </div>

          {/** Lưới Xem Trước Mockup Fanpage Facebook Chuẩn Thực Tế */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">preview</span>
                <span>Thư Viện Nhận Diện Fanpage (Mockup Facebook Chuẩn)</span>
              </h3>
              <div className="text-xs text-slate-400">
                Hiển thị các Fanpage trong hệ thống kèm Avatar 1:1 và Cover 16:9
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pages.map(page => {
                const hasAvatar = !!page.brandingAvatarUrl;
                const hasCover = !!page.brandingCoverUrl;
                const isApplying = isApplyingFacebook === page.id;

                return (
                  <div
                    key={page.id}
                    className="bg-fb-surface rounded-2xl border border-fb-surface-hover/60 overflow-hidden shadow-lg flex flex-col justify-between transition-all hover:border-slate-600"
                  >
                    <div>
                      {/** Khung Mockup Cover Banner 16:9 */}
                      <div className="relative aspect-video bg-slate-900 overflow-hidden border-b border-fb-surface-hover/40">
                        {page.brandingCoverUrl ? (
                          <img
                            src={page.brandingCoverUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                            <span className="material-symbols-outlined text-3xl mb-1 text-slate-600">panorama</span>
                            <span>Chưa có ảnh bìa tùy chỉnh</span>
                            <span className="text-[10px] text-slate-600 mt-0.5">Sẵn sàng để Muse vẽ</span>
                          </div>
                        )}

                        {/** Badge BM nổi góc phải */}
                        {page.businessName && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-bold border border-white/10">
                            {page.businessName}
                          </span>
                        )}

                        {/** Avatar 1:1 đè góc dưới trái */}
                        <div className="absolute -bottom-4 left-4 w-14 h-14 rounded-full border-3 border-fb-surface overflow-hidden bg-slate-800 shadow-xl">
                          {page.brandingAvatarUrl || page.avatar ? (
                            <img
                              src={page.brandingAvatarUrl || page.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                              {page.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/** Thông tin Fanpage bên dưới */}
                      <div className="pt-6 p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-white text-sm truncate" title={page.name}>
                            {page.name}
                          </h4>
                          {page.brandingStatus === 'PENDING' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                              Chờ Muse vẽ
                            </span>
                          )}
                          {page.brandingStatus === 'PROCESSING' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0 animate-pulse">
                              Đang vẽ...
                            </span>
                          )}
                          {page.brandingStatus === 'COMPLETED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                              Đã hoàn thành
                            </span>
                          )}
                        </div>

                        {/** Dòng Bio xem trước theo chuẩn Facebook */}
                        {page.brandingBio ? (
                          <p className="text-[11px] text-slate-300 italic line-clamp-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/40">
                            "{page.brandingBio}"
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500 italic">
                            Chưa cài đặt tiểu sử theo chủ đề
                          </p>
                        )}

                        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                          <span className="font-mono">ID: {page.fb_page_id || page.id}</span>
                          <span className="text-emerald-400/90 font-medium">{page.primarySourceWeb || 't6.goxo.us'}</span>
                        </div>
                      </div>
                    </div>

                    {/** Thanh Thao Tác Dưới Cùng */}
                    <div className="p-3 bg-slate-900/30 border-t border-fb-surface-hover/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {page.brandingCoverUrl && (
                          <a
                            href={page.brandingCoverUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 hover:bg-fb-surface-hover rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Xem Ảnh Bìa gốc"
                          >
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                          </a>
                        )}
                        {page.brandingStatus && page.brandingStatus !== 'NONE' && (
                          <button
                            type="button"
                            onClick={() => handleResetJob(page.id)}
                            className="p-1.5 hover:bg-fb-surface-hover rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                            title="Reset trạng thái job"
                          >
                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                          </button>
                        )}
                      </div>

                      {(hasAvatar || hasCover || !!(page.brandingBio || (page as any).branding_bio)) ? (
                        <button
                          type="button"
                          onClick={() => handleApplySinglePageFacebook(page)}
                          disabled={isApplying}
                          className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isApplying ? 'sync' : 'publish'}
                          </span>
                          <span>{isApplying ? 'Đang gắn...' : 'Gắn lên Facebook'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPageIds([page.id]);
                            setActiveTab(2);
                          }}
                          className="px-3 py-1.5 bg-fb-surface-hover hover:bg-fb-surface-hover/80 text-fb-text text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Cấu hình Page này
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
