
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed:', err));
            });
        }

        const { createApp, ref, computed, watch, nextTick, onMounted } = Vue

        const translations = {
            en: {
                appTitle: 'Card Editor', tabText: '1. Edit Text', tabDesign: '2. Layout & Style',
                titleLabel: 'Title', titlePlaceholder: 'Enter title here...',
                contentLabel: 'Caption / Content', contentHint: 'Type [image1] to place photos!', contentPlaceholder: 'Type your content here...',
                checkBtn: 'Check for XHS Sensitive Words', ratioLabel: 'Card Aspect Ratio', uploadLabel: 'Upload Multiple Photos',
                bgLabel: 'Card Background', bgDots: 'Dots', bgPlain: 'Plain White', bgCustom: 'Custom Image',
                safeMargin: 'Advanced: Safe Margin', exportBtn: 'Export {n} Pages', exporting: 'Exporting...',
                fontModern: 'Modern (Sans)', fontClassic: 'Classic (Serif)', fontPlayful: 'Playful', fontHandwriting: 'Handwriting',
                sizeHuge: 'Heading 1', sizeLarge: 'Heading 2', sizeMed: 'Heading 3',
                sizeContentLg: 'Large', sizeContentBase: 'Normal', sizeContentSm: 'Small',
                scanTitle: 'XHS Risk Check', scanPassed: 'Safe', scanFailed: 'Issues Found',
                scanIssuesFound: 'We checked your text against 4 strict XHS categories. Review the results below:',
                reasonLabel: 'Why:', suggestLabel: 'Fix:', closeBtn: 'Close',
                catAd: 'Ad Law Absolutes', catAdWhy: 'Violates China advertising laws; triggers automatic bot filters.', catAdFix: 'Use softer descriptive words (e.g., "works well", "personally love it").',
                catMkt: 'Marketing & Redirection', catMktWhy: 'XHS strictly bans moving traffic off their platform to WeChat, Taobao, etc.', catMktFix: 'Use homophones (e.g., "某宝"), emojis (🛒), or ask users to DM instead.',
                catMed: 'Medical & Superstition', catMedWhy: 'Requires verified medical qualification; otherwise flagged as false advertising.', catMedFix: 'Describe personal feelings instead of claiming medical "cures".',
                catPol: 'Social & Political Risks', catPolWhy: 'XHS algorithms suppress negative social news to maintain a positive community.', catPolFix: 'Avoid discussing authorities. Use emojis (👮) or Pinyin (jc) if necessary for a story.'
            },
            zh: {
                appTitle: '卡片编辑器', tabText: '1. 编辑图文', tabDesign: '2. 布局与样式',
                titleLabel: '标题', titlePlaceholder: '在此输入标题...',
                contentLabel: '正文', contentHint: '输入 [image1] 插入图片！', contentPlaceholder: '在此输入正文...',
                checkBtn: '小红书敏感词检测', ratioLabel: '卡片比例', uploadLabel: '上传多张图片',
                bgLabel: '卡片背景', bgDots: '波点', bgPlain: '纯白', bgCustom: '自定义',
                safeMargin: '高级：安全边距', exportBtn: '导出 {n} 张卡片', exporting: '导出中...',
                fontModern: '现代 (无衬线)', fontClassic: '经典 (衬线)', fontPlayful: '活泼', fontHandwriting: '手写',
                sizeHuge: '大标题 1', sizeLarge: '大标题 2', sizeMed: '大标题 3',
                sizeContentLg: '大', sizeContentBase: '中', sizeContentSm: '小',
                scanTitle: '小红书违禁词体检', scanPassed: '安全', scanFailed: '发现风险',
                scanIssuesFound: '我们为您检测了4大小红书违规雷区，请参考以下报告进行修改：',
                reasonLabel: '原因：', suggestLabel: '建议：', closeBtn: '关闭',
                catAd: '广告法绝对化用语', catAdWhy: '违反新广告法，极易触发机器审核拦截和限流。', catAdFix: '使用客观描述替代（如将“最好用”改为“亲测好用”）。',
                catMkt: '引流与过度营销', catMktWhy: '小红书严打向微信、淘宝等站外平台导流的行为。', catMktFix: '使用谐音字（如“某宝”）、Emoji（🛒），或引导用户看评论区。',
                catMed: '医疗与封建迷信', catMedWhy: '非医疗专业资质禁止发布功效承诺，封建迷信易被封号。', catMedFix: '分享个人真实感受，切勿使用“治愈”、“包治”等确切词汇。',
                catPol: '社会新闻与风控', catPolWhy: '平台崇尚“美好生活”，负面社会新闻与群体冲突极易被限流屏蔽。', catPolFix: '尽量避免涉政或公职人员话题，必须提及可使用拼音缩写（如 jc）或Emoji（👮）。'
            }
        }

        createApp({
            setup() {
                const locale = ref('en')
                const isDark = ref(false)
                
                const t = (key) => {
                    return translations[locale.value][key] || key
                }
                
                const toggleTheme = () => {
                    isDark.value = !isDark.value
                    if (isDark.value) document.documentElement.classList.add('dark')
                    else document.documentElement.classList.remove('dark')
                }
                
                const toggleLang = () => {
                    locale.value = locale.value === 'en' ? 'zh' : 'en'
                }

                const activeTab = ref('text')
                const title = ref('')
                const titleFont = ref("'Noto Sans SC', sans-serif")
                const titleSize = ref('h1')
                const content = ref('')
                const contentFont = ref("'Noto Sans SC', sans-serif")
                const contentSize = ref('base')
                const images = ref([]) 
                const bgImageUrl = ref('')
                const isExporting = ref(false)
                const bgStyle = ref('dots')
                const cardRatio = ref('3:4')
                const safeMargin = ref(48) 
                const calculatedPages = ref([])
                
                const showScanModal = ref(false)
                const scanReport = ref([])
                
                const scanSensitiveWords = () => {
                    const fullText = (title.value + ' ' + content.value)
                    
                    const report = [
                        { id: 'catAd', name: t('catAd'), why: t('catAdWhy'), fix: t('catAdFix'), words: ['最佳', '最具', '最爱', '第一', '首选', '顶级', '极致', '极品', '独一无二', '万能', '全网首发', '史无前例', '永久', '无敌', '最好用', '最便宜', '销量冠军', '绝对'], issues: [] },
                        { id: 'catMkt', name: t('catMkt'), why: t('catMktWhy'), fix: t('catMktFix'), words: ['下单', '购买', '淘宝', '天猫', '京东', '拼多多', '秒杀', '免费领取', '返利', '微信', '微信号', '手机号', 'QQ', '二维码', '加我', '私信领', '私信我', '链接', '代购', '赚钱', '求关注'], issues: [] },
                        { id: 'catMed', name: t('catMed'), why: t('catMedWhy'), fix: t('catMedFix'), words: ['治疗', '治愈', '药方', '根治', '消炎', '抗炎', '消斑', '排毒', '增强免疫力', '调节内分泌', '算命', '化解小人', '转运', '招财进宝', '逢考必过'], issues: [] },
                        { id: 'catPol', name: t('catPol'), why: t('catPolWhy'), fix: t('catPolFix'), words: ['警察', '城管', '保安', '维稳', '查水表', '暴乱', '游行', '集会', '维权', '报警', '国家级', '特供', '政府', '体制内', '贪污', '黑幕', '翻墙', '删帖', '封号'], issues: [] }
                    ]
                    
                    report.forEach(category => {
                        category.words.forEach(word => {
                            const regex = new RegExp(word, 'gi')
                            let match;
                            while ((match = regex.exec(fullText)) !== null) {
                                const start = Math.max(0, match.index - 12)
                                const end = Math.min(fullText.length, match.index + word.length + 12)
                                const context = fullText.substring(start, end).replace(/\n/g, ' ')
                                
                                if (!category.issues.some(r => r.word === word)) {
                                    category.issues.push({
                                        word: word,
                                        context: context
                                    })
                                }
                            }
                        })
                    })
                    
                    scanReport.value = report
                    showScanModal.value = true
                }

                const cardDimensions = computed(() => {
                    switch (cardRatio.value) {
                        case '3:4': return { width: '768px', height: '1024px' }
                        case '9:16': return { width: '720px', height: '1280px' }
                        case '1:1': return { width: '800px', height: '800px' }
                        case '4:3': return { width: '1024px', height: '768px' }
                        case '16:9': return { width: '1280px', height: '720px' }
                        default: return { width: '768px', height: '1024px' }
                    }
                })

                const titleClasses = computed(() => {
                    if (titleSize.value === 'h1') return 'text-5xl md:text-6xl font-black'
                    if (titleSize.value === 'h2') return 'text-4xl md:text-5xl font-bold'
                    return 'text-3xl md:text-4xl font-bold' 
                })

                const contentClasses = computed(() => {
                    if (contentSize.value === 'lg') return 'text-3xl font-medium'
                    if (contentSize.value === 'base') return 'text-2xl font-medium'
                    return 'text-xl font-normal' 
                })

                const repaginate = () => {
                    const container = document.getElementById('measure-container')
                    if (!container) return
                    
                    const maxHeight = parseInt(cardDimensions.value.height)
                    const pages = []
                    let currentPage = { title: '', elements: [] }
                    
                    container.innerHTML = '' 
                    
                    if (title.value) {
                        const titleEl = document.createElement('div')
                        titleEl.className = titleClasses.value + ' mb-6 whitespace-pre-wrap shrink-0'
                        titleEl.style.fontFamily = titleFont.value
                        titleEl.innerText = title.value
                        container.appendChild(titleEl)
                        
                        if (container.offsetHeight > maxHeight) {
                            pages.push({ title: title.value, elements: [] })
                            container.innerHTML = '' 
                        } else {
                            currentPage.title = title.value
                        }
                    }
                    
                    const paras = content.value.split('\n')
                    let contentWrapper = document.createElement('div')
                    contentWrapper.className = 'flex flex-col flex-grow'
                    contentWrapper.style.gap = '1rem'
                    container.appendChild(contentWrapper)
                    
                    let usedImageIndices = new Set()

                    for (let p of paras) {
                        const trimmed = p.trim()
                        let match = trimmed.match(/^\[image(\d*)\]$/i)
                        
                        if (match) {
                            let imgIndex = match[1] ? parseInt(match[1]) - 1 : 0
                            let src = images.value[imgIndex]
                            
                            if (src) {
                                usedImageIndices.add(imgIndex)
                                const imgEl = document.createElement('img')
                                imgEl.src = src
                                imgEl.style.maxHeight = '400px'
                                imgEl.style.objectFit = 'contain'
                                imgEl.style.marginTop = '8px'
                                imgEl.style.marginBottom = '8px'
                                contentWrapper.appendChild(imgEl)
                                
                                if (container.offsetHeight > maxHeight) {
                                    contentWrapper.removeChild(imgEl)
                                    if (currentPage.title || currentPage.elements.length > 0) {
                                        pages.push({...currentPage})
                                    }
                                    currentPage = { title: '', elements: [{ type: 'image', src: src }] }
                                    container.innerHTML = ''
                                    const newWrapper = document.createElement('div')
                                    newWrapper.className = 'flex flex-col flex-grow'
                                    newWrapper.style.gap = '1rem'
                                    container.appendChild(newWrapper)
                                    newWrapper.appendChild(imgEl)
                                    contentWrapper = newWrapper
                                } else {
                                    currentPage.elements.push({ type: 'image', src: src })
                                }
                            }
                            continue 
                        }
                        
                        const pEl = document.createElement('div')
                        pEl.innerText = p
                        if (p.trim() === '') pEl.innerHTML = '\u200b'
                        pEl.className = contentClasses.value + ' leading-relaxed whitespace-pre-wrap shrink-0'
                        pEl.style.fontFamily = contentFont.value
                        pEl.style.wordBreak = 'break-word'
                        contentWrapper.appendChild(pEl)
                        
                        if (container.offsetHeight > maxHeight) {
                            contentWrapper.removeChild(pEl)
                            if (currentPage.title || currentPage.elements.length > 0) {
                                pages.push({...currentPage})
                            }
                            currentPage = { title: '', elements: [{ type: 'text', content: p }] }
                            container.innerHTML = ''
                            const newWrapper = document.createElement('div')
                            newWrapper.className = 'flex flex-col flex-grow'
                            newWrapper.style.gap = '1rem'
                            container.appendChild(newWrapper)
                            newWrapper.appendChild(pEl)
                            contentWrapper = newWrapper
                        } else {
                            currentPage.elements.push({ type: 'text', content: p })
                        }
                    }
                    
                    for (let i = 0; i < images.value.length; i++) {
                        if (!usedImageIndices.has(i)) {
                            const estimatedImgHeight = 424 
                            if (container.offsetHeight + estimatedImgHeight > maxHeight) {
                                if (currentPage.title || currentPage.elements.length > 0) {
                                    pages.push({...currentPage})
                                }
                                currentPage = { title: '', elements: [{ type: 'image', src: images.value[i] }] }
                            } else {
                                currentPage.elements.push({ type: 'image', src: images.value[i] })
                            }
                        }
                    }
                    
                    if (currentPage.title || currentPage.elements.length > 0) {
                        pages.push(currentPage)
                    }
                    
                    if (pages.length === 0) {
                        pages.push({ title: '', elements: [] })
                    }
                    
                    calculatedPages.value = pages
                }

                watch([title, titleFont, titleSize, content, contentFont, contentSize, images, cardRatio, safeMargin], () => {
                    nextTick(() => {
                        repaginate()
                    })
                }, { deep: true, immediate: true })

                onMounted(() => {
                    setTimeout(() => repaginate(), 100)
                })

                const handleImageUpload = (event) => {
                    const files = event.target.files
                    if (!files) return
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i]
                        const reader = new FileReader()
                        reader.onload = (e) => {
                            images.value.push(e.target.result)
                        }
                        reader.readAsDataURL(file)
                    }
                    event.target.value = '' 
                }
                
                const removeImage = (index) => {
                    images.value.splice(index, 1)
                }

                const handleBgUpload = (event) => {
                    const file = event.target.files[0]
                    if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                            bgImageUrl.value = e.target.result
                        }
                        reader.readAsDataURL(file)
                    }
                }

                const delay = (ms) => new Promise(res => setTimeout(res, ms))

                const exportImage = async () => {
                    if (isExporting.value) return
                    isExporting.value = true
                    try {
                        for (let index = 0; index < calculatedPages.value.length; index++) {
                            const pageNumber = index + 1
                            const element = document.getElementById('export-card-' + pageNumber)
                            const canvas = await html2canvas(element, {
                                scale: 2, 
                                useCORS: true,
                                backgroundColor: bgStyle.value === 'dots' ? (document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff') : (bgStyle.value === 'plain' ? (document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff') : null),
                            })
                            
                            const link = document.createElement('a')
                            link.download = `xhs-card-p${pageNumber}-${new Date().getTime()}.png`
                            link.href = canvas.toDataURL('image/png')
                            link.click()
                            
                            await delay(300)
                        }
                    } catch (error) {
                        console.error('Export failed:', error)
                        alert('Failed to export image. Please try again.')
                    } finally {
                        isExporting.value = false
                    }
                }

                return {
                    locale, isDark, t, toggleTheme, toggleLang,
                    activeTab, title, titleFont, titleSize, titleClasses, content, contentFont, contentSize, contentClasses,
                    images, bgImageUrl, isExporting, bgStyle, cardRatio, safeMargin, cardDimensions, calculatedPages,
                    handleImageUpload, handleBgUpload, removeImage, exportImage,
                    showScanModal, scanReport, scanSensitiveWords
                }
            }
        }).mount('#app')
    
