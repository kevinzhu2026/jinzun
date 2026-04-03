// 澳门金尊员工产品培训系统 - JavaScript文件

// 导航栏切换
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('show');
            }
        });
    }
    
    // 设置当前页面激活状态
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath === linkPath || 
            (currentPath.startsWith(linkPath) && linkPath !== '/')) {
            link.classList.add('active');
        }
    });
    
    // 显示当前时间
    updateDateTime();
    setInterval(updateDateTime, 60000); // 每分钟更新一次
});

// 更新日期时间
function updateDateTime() {
    const now = new Date();
    const dateTimeElement = document.getElementById('currentDateTime');
    
    if (dateTimeElement) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
        };
        dateTimeElement.textContent = now.toLocaleDateString('zh-CN', options);
    }
}

// 考试相关功能
class ExamSystem {
    constructor() {
        this.currentLevel = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.examStarted = false;
        this.timer = null;
        this.timeRemaining = 1800; // 30分钟，单位：秒
    }
    
    startExam(level) {
        this.currentLevel = level;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.examStarted = true;
        this.timeRemaining = 1800;
        
        // 显示考试界面
        this.showExamInterface();
        
        // 开始计时器
        this.startTimer();
        
        // 加载题目
        this.loadQuestions(level);
    }
    
    showExamInterface() {
        // 这里应该显示考试界面
        console.log('开始考试:', this.currentLevel);
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.submitExam();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timerElement = document.getElementById('examTimer');
        
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // 最后5分钟变红色
            if (this.timeRemaining <= 300) {
                timerElement.style.color = '#e74c3c';
            }
        }
    }
    
    loadQuestions(level) {
        fetch(`/api/get_questions?level=${level}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                
                this.questions = data.questions;
                this.displayQuestion(0);
            })
            .catch(error => {
                console.error('加载题目失败:', error);
                alert('加载题目失败，请检查网络连接');
            });
    }
    
    displayQuestion(index) {
        if (index < 0 || index >= this.questions.length) {
            return;
        }
        
        this.currentQuestionIndex = index;
        const question = this.questions[index];
        
        // 这里应该更新界面显示题目
        console.log('显示题目:', question);
    }
    
    submitAnswer(answer) {
        const question = this.questions[this.currentQuestionIndex];
        
        this.userAnswers.push({
            question_id: question.id,
            answer: answer
        });
        
        // 下一题或提交
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.displayQuestion(this.currentQuestionIndex + 1);
        } else {
            this.submitExam();
        }
    }
    
    submitExam() {
        clearInterval(this.timer);
        
        fetch('/api/submit_exam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                level: this.currentLevel,
                answers: this.userAnswers
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            
            this.showResults(data);
        })
        .catch(error => {
            console.error('提交考试失败:', error);
            alert('提交考试失败，请稍后重试');
        });
    }
    
    showResults(data) {
        // 这里应该显示考试结果
        console.log('考试结果:', data);
        
        // 跳转到成绩页面
        window.location.href = '/results';
    }
}

// 全局考试系统实例
window.examSystem = new ExamSystem();

// 工具函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'info') {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 3秒后移除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 添加toast样式
const toastStyle = document.createElement('style');
toastStyle.textContent = `
.toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast.show {
    transform: translateY(0);
    opacity: 1;
}

.toast-info {
    background-color: #3498db;
}

.toast-success {
    background-color: #27ae60;
}

.toast-warning {
    background-color: #f39c12;
}

.toast-error {
    background-color: #e74c3c;
}
`;
document.head.appendChild(toastStyle);

// 页面加载完成后的初始化
window.addEventListener('load', function() {
    // 检查是否有未完成的考试
    const savedExam = localStorage.getItem('currentExam');
    if (savedExam) {
        try {
            const examData = JSON.parse(savedExam);
            if (confirm('检测到未完成的考试，是否继续？')) {
                window.examSystem.startExam(examData.level);
            } else {
                localStorage.removeItem('currentExam');
            }
        } catch (e) {
            localStorage.removeItem('currentExam');
        }
    }
    
    // 页面离开时保存考试状态
    window.addEventListener('beforeunload', function(e) {
        if (window.examSystem.examStarted) {
            const examData = {
                level: window.examSystem.currentLevel,
                questions: window.examSystem.questions,
                currentIndex: window.examSystem.currentQuestionIndex,
                answers: window.examSystem.userAnswers,
                timeRemaining: window.examSystem.timeRemaining
            };
            localStorage.setItem('currentExam', JSON.stringify(examData));
            
            // 显示确认对话框
            e.preventDefault();
            e.returnValue = '您有未完成的考试，确定要离开吗？';
        }
    });
});

// 导出函数供其他页面使用
window.formatDate = formatDate;
window.showToast = showToast;