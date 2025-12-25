// src/translations/index.js

export const translations = {
  Vietnamese: {
    // Header
    header: {
      search: "Tìm kiếm bài viết...",
      home: "Trang chủ",
      myPosts: "Bài viết của tôi",
      createPost: "Tạo bài viết",
      profile: "Hồ sơ",
      settings: "Cài đặt",
      logout: "Đăng xuất",
      login: "Đăng nhập",
      register: "Đăng ký",
    },

    // Settings Page
    settings: {
      title: "Cài đặt",
      subtitle: "Tùy chỉnh trải nghiệm ứng dụng và tùy chọn của bạn",
      
      // Notifications Section
      notifications: {
        title: "Thông báo",
        description: "Quản lý cách bạn nhận thông báo",
        email: "Thông báo qua Email",
        emailDesc: "Nhận thông báo qua email",
        push: "Thông báo đẩy",
        pushDesc: "Nhận thông báo đẩy trên trình duyệt",
        comments: "Thông báo bình luận",
        commentsDesc: "Nhận thông báo khi có người bình luận bài viết của bạn",
        aiSuggestions: "Thông báo gợi ý AI",
        aiSuggestionsDesc: "Nhận thông báo khi AI tạo gợi ý cho bài viết của bạn",
      },

      // Language & Region Section
      language: {
        title: "Ngôn ngữ & Vùng",
        description: "Đặt ngôn ngữ ưa thích của bạn",
        label: "Ngôn ngữ",
      },

      // Appearance Section
      appearance: {
        title: "Giao diện",
        description: "Tùy chỉnh giao diện",
        label: "Chủ đề",
        systemDefault: "Mặc định hệ thống",
        light: "Sáng",
        dark: "Tối",
      },
    },

    // Home Page
    home: {
      welcome: "Chào mừng đến với EduShare",
      description: "Chia sẻ các slide thử thách và nhận gợi ý từ AI cùng các nhà giáo dục khác.",
      allPosts: "Tất cả bài viết",
      noPosts: "Không tìm thấy bài viết nào.",
      loading: "Đang tải...",
      latest: "Mới nhất",
      allSubjects: "Tất cả môn học",
      biology: "Sinh học",
      mathematics: "Toán học",
      history: "Lịch sử",
      physics: "Vật lý",
      chemistry: "Hóa học",
      literature: "Văn học",
      geography: "Địa lý",
      english: "Tiếng Anh",
      computerScience: "Tin học",
      art: "Mỹ thuật",
      music: "Âm nhạc",
      sortNewest: "Sắp xếp mặc định (Mới nhất)",
      sortTitle: "Sắp xếp theo: Tiêu đề",
      ascending: "Tăng dần",
      descending: "Giảm dần",
      clearFilters: "Xóa bộ lọc",
      page: "Trang",
      previous: "Trước",
      next: "Tiếp",
    },

    // My Posts Page
    myPosts: {
      title: "Bài viết của tôi",
      noPosts: "Bạn chưa có bài viết nào",
      createFirst: "Tạo bài viết đầu tiên của bạn",
    },

    // Post Detail Page
    postDetail: {
      loading: "Đang tải bài viết...",
      notFound: "Không tìm thấy bài viết",
      comments: "Bình luận",
      noComments: "Chưa có bình luận nào",
      addComment: "Thêm bình luận...",
      send: "Gửi",
    },

    // Post Card
    post: {
      edit: "Chỉnh sửa",
      delete: "Xóa",
      confirmDelete: "Bạn có chắc chắn muốn xóa bài viết này?",
      views: "lượt xem",
      comments: "bình luận",
      likes: "thích",
      unknownAuthor: "Không rõ",
      timeAgo: "khoảng 2 giờ trước",
      aiSuggested: "Gợi ý AI",
      categoryBiology: "Sinh học",
      categoryMathematics: "Toán học",
      categoryHistory: "Lịch sử",
      categoryPhysics: "Vật lý",
      categoryChemistry: "Hóa học",
      categoryLiterature: "Văn học",
      categoryGeography: "Địa lý",
      categoryEnglish: "Tiếng Anh",
      categoryComputerScience: "Tin học",
      categoryArt: "Mỹ thuật",
      categoryMusic: "Âm nhạc",
    },

    // Profile Page
    profile: {
      title: "Hồ sơ",
      edit: "Chỉnh sửa hồ sơ",
      save: "Lưu",
      cancel: "Hủy",
      name: "Tên",
      email: "Email",
      bio: "Giới thiệu",
      avatar: "Ảnh đại diện",
      changeAvatar: "Đổi ảnh đại diện",
      posts: "Bài viết",
      followers: "Người theo dõi",
      following: "Đang theo dõi",
    },

    // Login Page
    login: {
      title: "Đăng nhập",
      subtitle: "Đăng nhập để tiếp tục",
      email: "Email",
      password: "Mật khẩu",
      submit: "Đăng nhập",
      noAccount: "Chưa có tài khoản?",
      register: "Đăng ký ngay",
      error: "Đăng nhập thất bại",
    },

    // Register Page
    register: {
      title: "Đăng ký",
      subtitle: "Tạo tài khoản mới",
      name: "Tên",
      email: "Email",
      password: "Mật khẩu",
      confirmPassword: "Xác nhận mật khẩu",
      submit: "Đăng ký",
      hasAccount: "Đã có tài khoản?",
      login: "Đăng nhập ngay",
      error: "Đăng ký thất bại",
      passwordMismatch: "Mật khẩu không khớp",
    },

    // Post Modal
    postModal: {
      create: "Tạo bài viết mới",
      edit: "Chỉnh sửa bài viết",
      description: "Chia sẻ slide khó giải thích và nhận gợi ý từ AI cùng lời khuyên từ các giáo viên khác.",
      title: "Tiêu đề",
      titlePlaceholder: "Ví dụ: Làm thế nào để giải thích quang hợp một cách trực quan?",
      category: "Môn học",
      selectCategory: "Chọn môn học",
      biology: "Sinh học",
      mathematics: "Toán học",
      history: "Lịch sử",
      physics: "Vật lý",
      chemistry: "Hóa học",
      literature: "Văn học",
      geography: "Địa lý",
      english: "Tiếng Anh",
      computerScience: "Tin học",
      art: "Mỹ thuật",
      music: "Âm nhạc",
      authorName: "Tên tác giả",
      authorPlaceholder: "Tên của bạn",
      descriptionLabel: "Mô tả",
      descriptionPlaceholder: "Mô tả điều gì làm cho slide này khó giải thích...",
      thumbnail: "Ảnh đại diện (1 file)",
      thumbnailPreview: "Xem trước ảnh đại diện",
      slides: "Tài liệu (Slides) (có thể chọn nhiều file)",
      slide: "Slide",
      submit: "Đăng bài",
      posting: "Đang đăng...",
      update: "Cập nhật",
      cancel: "Hủy",
      error: "Đăng bài thất bại. Vui lòng kiểm tra backend logs / network tab.",
    },

    // Notification
    notification: {
      title: "Thông báo",
      noNotifications: "Không có thông báo",
      markAllRead: "Đánh dấu đã đọc tất cả",
      clearAll: "Xóa tất cả",
      justNow: "Vừa xong",
      minutesAgo: "phút trước",
      hoursAgo: "giờ trước",
      daysAgo: "ngày trước",
    },

    // Common
    common: {
      loading: "Đang tải...",
      error: "Có lỗi xảy ra",
      success: "Thành công",
      confirm: "Xác nhận",
      cancel: "Hủy",
      save: "Lưu",
      delete: "Xóa",
      edit: "Chỉnh sửa",
      back: "Quay lại",
      next: "Tiếp theo",
      previous: "Trước",
      search: "Tìm kiếm",
      filter: "Lọc",
      sort: "Sắp xếp",
      submit: "Gửi",
    },
  },

  Japanese: {
    // Header
    header: {
      search: "投稿を検索...",
      home: "ホーム",
      myPosts: "マイ投稿",
      createPost: "投稿を作成",
      profile: "プロフィール",
      settings: "設定",
      logout: "ログアウト",
      login: "ログイン",
      register: "登録",
    },

    // Settings Page
    settings: {
      title: "設定",
      subtitle: "アプリの体験と設定をカスタマイズ",
      
      // Notifications Section
      notifications: {
        title: "通知",
        description: "通知の受信方法を管理",
        email: "メール通知",
        emailDesc: "メールで通知を受け取る",
        push: "プッシュ通知",
        pushDesc: "ブラウザでプッシュ通知を受け取る",
        comments: "コメント通知",
        commentsDesc: "投稿にコメントがあったときに通知を受け取る",
        aiSuggestions: "AI提案通知",
        aiSuggestionsDesc: "AIが投稿の提案を生成したときに通知を受け取る",
      },

      // Language & Region Section
      language: {
        title: "言語と地域",
        description: "優先言語を設定",
        label: "言語",
      },

      // Appearance Section
      appearance: {
        title: "外観",
        description: "外観をカスタマイズ",
        label: "テーマ",
        systemDefault: "システムデフォルト",
        light: "ライト",
        dark: "ダーク",
      },
    },

    // Home Page
    home: {
      welcome: "EduShareへようこそ",
      description: "難しいスライドを共有し、仲間の教育者からAI搭載の提案を受けます。",
      allPosts: "すべての投稿",
      noPosts: "投稿が見つかりません。",
      loading: "読み込み中...",
      latest: "最新",
      allSubjects: "すべての科目",
      biology: "生物学",
      mathematics: "数学",
      history: "歴史",
      physics: "物理学",
      chemistry: "化学",
      literature: "文学",
      geography: "地理",
      english: "英語",
      computerScience: "情報科学",
      art: "美術",
      music: "音楽",
      sortNewest: "デフォルトの並び替え（最新）",
      sortTitle: "並び替え：タイトル",
      ascending: "昇順",
      descending: "降順",
      clearFilters: "フィルタをクリア",
      page: "ページ",
      previous: "前へ",
      next: "次へ",
    },

    // My Posts Page
    myPosts: {
      title: "マイ投稿",
      noPosts: "投稿がありません",
      createFirst: "最初の投稿を作成",
    },

    // Post Detail Page
    postDetail: {
      loading: "投稿を読み込み中...",
      notFound: "投稿が見つかりません",
      comments: "コメント",
      noComments: "コメントがありません",
      addComment: "コメントを追加...",
      send: "送信",
    },

    // Post Card
    post: {
      edit: "編集",
      delete: "削除",
      confirmDelete: "この投稿を削除してもよろしいですか？",
      views: "ビュー",
      comments: "コメント",
      likes: "いいね",
      unknownAuthor: "不明",
      timeAgo: "約2時間前",
      aiSuggested: "AI提案",
      categoryBiology: "生物学",
      categoryMathematics: "数学",
      categoryHistory: "歴史",
      categoryPhysics: "物理学",
      categoryChemistry: "化学",
      categoryLiterature: "文学",
      categoryGeography: "地理",
      categoryEnglish: "英語",
      categoryComputerScience: "情報科学",
      categoryArt: "美術",
      categoryMusic: "音楽",
    },

    // Profile Page
    profile: {
      title: "プロフィール",
      edit: "プロフィールを編集",
      save: "保存",
      cancel: "キャンセル",
      name: "名前",
      email: "メール",
      bio: "自己紹介",
      avatar: "アバター",
      changeAvatar: "アバターを変更",
      posts: "投稿",
      followers: "フォロワー",
      following: "フォロー中",
    },

    // Login Page
    login: {
      title: "ログイン",
      subtitle: "続行するにはログインしてください",
      email: "メール",
      password: "パスワード",
      submit: "ログイン",
      noAccount: "アカウントをお持ちでないですか？",
      register: "今すぐ登録",
      error: "ログインに失敗しました",
    },

    // Register Page
    register: {
      title: "登録",
      subtitle: "新しいアカウントを作成",
      name: "名前",
      email: "メール",
      password: "パスワード",
      confirmPassword: "パスワード確認",
      submit: "登録",
      hasAccount: "すでにアカウントをお持ちですか？",
      login: "今すぐログイン",
      error: "登録に失敗しました",
      passwordMismatch: "パスワードが一致しません",
    },

    // Post Modal
    postModal: {
      create: "新しい投稿を作成",
      edit: "投稿を編集",
      description: "説明が難しいスライドを共有し、AIからの提案と仲間の教育者からのアドバイスを受け取ります。",
      title: "タイトル",
      titlePlaceholder: "例：光合成を視覚的に説明するには？",
      category: "科目",
      selectCategory: "科目を選択",
      biology: "生物学",
      mathematics: "数学",
      history: "歴史",
      physics: "物理学",
      chemistry: "化学",
      literature: "文学",
      geography: "地理",
      english: "英語",
      computerScience: "情報科学",
      art: "美術",
      music: "音楽",
      authorName: "著者名",
      authorPlaceholder: "あなたの名前",
      descriptionLabel: "説明",
      descriptionPlaceholder: "このスライドを説明することが難しい理由を説明してください...",
      thumbnail: "サムネイル画像（1ファイル）",
      thumbnailPreview: "サムネイルプレビュー",
      slides: "スライドファイル（複数ファイルを選択可能）",
      slide: "スライド",
      submit: "投稿",
      posting: "投稿中...",
      update: "更新",
      cancel: "キャンセル",
      error: "投稿に失敗しました。バックエンドログまたはネットワークタブを確認してください。",
    },

    // Notification
    notification: {
      title: "通知",
      noNotifications: "通知はありません",
      markAllRead: "すべて既読にする",
      clearAll: "すべてクリア",
      justNow: "たった今",
      minutesAgo: "分前",
      hoursAgo: "時間前",
      daysAgo: "日前",
    },

    // Common
    common: {
      loading: "読み込み中...",
      error: "エラーが発生しました",
      success: "成功",
      confirm: "確認",
      cancel: "キャンセル",
      save: "保存",
      delete: "削除",
      edit: "編集",
      back: "戻る",
      next: "次へ",
      previous: "前へ",
      search: "検索",
      filter: "フィルター",
      sort: "並び替え",
      submit: "送信",
    },
  },
};

