let defaultRootStyle;

function toggleLightMode() {
  const icon = document.getElementById('icon');
  const root = document.documentElement;

  if (icon.classList.contains('fa-moon-o')) {
    icon.classList.remove('fa-moon-o');
    icon.classList.add('fa-sun-o');

    root.style.setProperty('color-scheme', 'light');
    root.style.setProperty('--bg-col', '#ffffff');
    root.style.setProperty('--bg-rgb-full', 'rgb(255, 255, 255)');
    root.style.setProperty('--bg-rgb-half', 'rgb(226, 226, 226, 0.3)');
    root.style.setProperty('--text-grey', 'grey');
    root.style.setProperty('--text-normal', '#000000');
    root.style.setProperty('--frame-bcol', '#EFEFEF');

  } else {
    icon.classList.remove('fa-sun-o');
    icon.classList.add('fa-moon-o');
    
    root.style.setProperty('color-scheme', defaultRootStyle.colorScheme);
    root.style.setProperty('--bg-col', defaultRootStyle.bgCol);
    root.style.setProperty('--bg-rgb-full', defaultRootStyle.bgRgbFull);
    root.style.setProperty('--bg-rgb-half', defaultRootStyle.bgRgbHalf);
    root.style.setProperty('--text-grey', defaultRootStyle.textGrey);
    root.style.setProperty('--text-normal', defaultRootStyle.textNormal);
    root.style.setProperty('--frame-bcol', defaultRootStyle.frameBcol);
  }
}


function menuTrigger(menuIcon) {
  menuIcon.classList.toggle("active");

  const overlay = document.getElementById("side-bar");
  overlay.classList.toggle("open");

  localStorage.setItem("sidebarOpen", overlay.classList.contains("open"));
}

function updateSidebarState() {
  const overlay = document.getElementById("side-bar");
  if (localStorage.getItem("sidebarOpen") === "true") {
    overlay.classList.add("open");
    const menuIcon = document.querySelector(".menu-icon"); // replace with the actual selector
    if (menuIcon) {
      menuIcon.classList.add("active");
    }
  } else {
    overlay.classList.remove("open");
  }
}

function lerpString(initial, final, t) {
    t = Math.max(0, Math.min(1, t));
    const numCharsFromFinal = Math.floor(t * final.length);
    let result = '';
    for (let i = 0; i < Math.max(initial.length, final.length); i++) {
        if (i < numCharsFromFinal) {
            result += final[i] || '';
        } else {
            result += initial[i] || '';
        }
    }

    return result;
}

/*toggleLightMode()*/
updateSidebarState();

document.addEventListener("DOMContentLoaded", function () {
  const name = document.getElementById("airzy");
  
  const targetText = "Airzy";
  const characters = "αβγδεζηθικλμνξοπρστυφχψωπ";
  let currentText = " ".repeat(5);
  name.innerText = currentText;

  let index = 0;
  let count = 0;
  
  const root = document.documentElement;
  defaultRootStyle = {
    colorScheme: getComputedStyle(root).getPropertyValue('color-scheme'),
    bgCol: getComputedStyle(root).getPropertyValue('--bg-col'),
    bgRgbFull: getComputedStyle(root).getPropertyValue('--bg-rgb-full'),
    bgRgbHalf: getComputedStyle(root).getPropertyValue('--bg-rgb-half'),
    textGrey: getComputedStyle(root).getPropertyValue('--text-grey'),
    textNormal: getComputedStyle(root).getPropertyValue('--text-normal'),
    frameBcol: getComputedStyle(root).getPropertyValue('--frame-bcol')
  };

  const interval = setInterval(() => {
    if (count < 2) {
      currentText =
        currentText.substring(0, index) +
        characters.charAt(Math.floor(Math.random() * characters.length)) +
        currentText.substring(index + 1);
      name.innerText = currentText;
      count++;
    } else {
      currentText =
        currentText.substring(0, index) +
        targetText.charAt(index) +
        currentText.substring(index + 1);
      name.innerText = currentText;
      index++;
      count = 0;
    }

    if (index >= targetText.length) {
      name.classList.add("glow");
      clearInterval(interval);
      handleSections()
    }
  }, 80);
});

function isInViewport(el) {
  const rect = el.getBoundingClientRect(); // TODO optimize this
  return (
    rect.top >= 0 &&
    rect.bottom-rect.height/2 <= (window.innerHeight || document.documentElement.clientHeight)
  );
}

function handleSections() {
  const sections = document.querySelectorAll('.txt-section');
  sections.forEach(section => {
    if (isInViewport(section)) {
      section.classList.add('show');
    }
  });
}

async function reloadProjects() {
  try {
    const projectsFetch = await fetch('https://airzy.glitch.me/api/projects');
    if (!projectsFetch.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const projects = await projectsFetch.json();
    projects.sort((a, b) => a.rank - b.rank);


    const container = document.getElementById('projects');
    container.innerHTML = '';
    
    projects.forEach((proj, index) => setTimeout(() => {
      const cardContainer = document.createElement('div');
      cardContainer.classList.add('project-container');
      
      /*const card = document.createElement('div');
      card.classList.add('project-card');

      card.addEventListener('click', (event) => {
        if (event.target.tagName.toLowerCase() === 'a') {
          return;
        }
        window.open(proj.url, '_blank');
      });*/
      
      const card = document.createElement('a');
      card.href = proj.url;
      card.target = '_blank';
      card.classList.add('project-card');
      
      if (proj.img) {
        const img = document.createElement('img');
        img.src = proj.img;
        img.alt = proj.alt;
        img.width = 200;
        img.height = 200;
        card.appendChild(img);
      }
      
      const pTitle = document.createElement('p');
      pTitle.textContent = proj.title;
      pTitle.classList.add('proj-title');
      card.appendChild(pTitle);
      
      const textContainer = document.createElement('div');
      proj.text.forEach(line => {
        const p = document.createElement('p');

        // regex for [link text]("url")
        const regex = /\[([^\]]+)\]\("([^"]+)"\)/g;
        let modifiedLine = line;

        // replace with nchor
        modifiedLine = modifiedLine.replace(regex, (match, linkText, url) => {
          return `<a href="${url}" target="_blank">${linkText}</a>`;
        });

        p.innerHTML = modifiedLine;
        textContainer.appendChild(p);
      });
      
      card.appendChild(textContainer);

      const footer = document.createElement('div');
      footer.classList.add('project-footer');
      
      proj.tags.forEach(tag => {
        const p = document.createElement('p');
        p.textContent = tag;
        footer.appendChild(p);
      });
      
      cardContainer.appendChild(card)
      cardContainer.appendChild(footer)
      container.appendChild(cardContainer);
    }, index * 100)); 

  } catch (error) {
    let errorMessage = 'Failed to load projects.';
    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      errorMessage = 'Network error: Please check your internet connection or server availability.';
    }
    else if (error.message.includes('HTTP error')) {
      const status = error.message.split(' ')[2];  // Extract HTTP status
      errorMessage = `Server returned an error: ${status}. Please try again later.`;
    }
    alert(errorMessage);
  }
}

let projectsLoaded = false;
async function loadProjects() {
  if (projectsLoaded) {
    return;
  }
  projectsLoaded = true;
    await fetch('projects.html')
      .then(response => {
        if (response.ok) {
          return response.text();
        } else {
          console.log(response)
          projectsLoaded = false
        }
      }).then(htmlContent => {
        document.querySelector('#main-content article').insertAdjacentHTML('beforeend', htmlContent);
        handleSections()
      }).catch(error => {
        projectsLoaded = false;
        console.error('Error:', error);
      });
  
    reloadProjects()
}

let introsLoaded = false
async function loadIntro() {
  if (introsLoaded) {
    return;
  }
  introsLoaded = true;
    await fetch('intro.html')
      .then(response => {
        if (response.ok) {
          return response.text();
        } else {
          console.log(response)
          introsLoaded = false
        }
      }).then(htmlContent => {
        document.querySelector('#main-content article').insertAdjacentHTML('beforeend', htmlContent);
        handleSections()
      }).catch(error => {
        introsLoaded = false;
        console.error('Error:', error);
      });
}

let canLoadContent = true;
const mainContentElm = document.getElementById("main-content");
mainContentElm.addEventListener("scroll", function () {
  const main = this;
  const scrollTop = main.scrollTop; // scroll position from top
  const scrollHeight = main.scrollHeight - main.clientHeight; // total scrollable height

  const scrollPercentage = (scrollTop / scrollHeight) * 100;

  const nav = document.getElementsByTagName("nav")[0];
  const section1 = document.getElementById("s1");
  
  if (scrollTop < 800) {
    nav.style.minHeight = `${100 - scrollTop / 8}px`;
  }
  section1.style.top = `${140-scrollTop/6}px`

  
  const adapt = document.getElementById("adapt");
  if (scrollTop > 700 && scrollTop < 740 && adapt.innerText == "grow") {
    let t = 0
    const interval = setInterval(() => {
      t += 0.2
      adapt.innerText = lerpString("grow", "ADAPT", t)
      if (t > 2 || adapt.innerText == "ADAPT") {
        clearInterval(interval);
      }
    }, 80);
  }
  
  if ((scrollHeight-scrollTop) < 200 && canLoadContent) {
    //fetch('intro.html')
    if (!projectsLoaded) {
      console.log("LOAD")
      loadProjects()
    } else if (!introsLoaded) {
      loadIntro()
    }
    canLoadContent = false;
    setTimeout(() => {
      canLoadContent = true;
    }, 500);
  }
  
  handleSections()
  console.log(`Scrolled: ${scrollPercentage.toFixed(2)}%`);
});

async function scrollTo(v) {
  mainContentElm.scrollTo({
    top: 0,
    behavior: 'instant'
  });
  mainContentElm.scrollTo({
    top: v,
    behavior: 'smooth'
  })
}

// the navigation
async function toResources() {
  if (!projectsLoaded) {
    await loadProjects();
  }
  const targetElm = document.getElementById('projects');
  console.log(targetElm)
  
  const pageOffset = targetElm.getBoundingClientRect().top
  scrollTo(pageOffset-100)
}

async function toAirzy() {
  if (!introsLoaded) {
    await loadIntro();
  }
  const targetElm = document.getElementById('intro-section');
  console.log(targetElm)
  
  const pageOffset = targetElm.getBoundingClientRect().top
  scrollTo(pageOffset-100)
}
