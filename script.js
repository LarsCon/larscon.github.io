let isMouseOverWindow = true;
let activeFilters = new Set(['all']);

// DOM Elements (will be initialized after DOM loads)
let cube, cubeContainer, frontFace, hamburger, navMenu, navLinks, timelineItems, filterBtns, portfolioGrid, modal, modalContent, closeModal, contactForm;

// Portfolio Data - All real projects from Lars's portfolio with original titles and descriptions
const portfolioItems = [
    {
        id: 1,
        title: "Trade Spot",
        categories: ["Programming", "Recreational"],
        image: "assets/programming/tradespot.png",
        description: "This is a passion project of mine, a website for trading physical trading cards! It's now live and half functional in Alpha testing. Currently password protected, inquire to learn more!",
        tags: ["HTML", "CSS", "JavaScript", "Python", "SQL", "2025"],
        link: "https://thetraderspot.com/",
        details: "This is a passion project of mine, a website for trading physical trading cards! It's now live and half functional in Alpha testing. Currently password protected, inquire to learn more!"
    },
    {
        id: 74,
        title: "Reblade",
        categories: ["Programming", "Professional"],
        image: "assets/programming/ReBlade.gif",
        description: "Beyblade battle recording software designed for easy replayability. Currently in testing for Android and in development for Apple iOS. Allows users to record, review, and analyze Beyblade battles.",
        tags: ["Android", "iOS", "2026"],
        link: "#",
        details: "Beyblade battle recording software designed for easy replayability. Currently in testing for Android and in development for Apple iOS. Allows users to record, review, and analyze Beyblade battles."
    },
    {
        id: 73,
        title: "Sister's Portfolio",
        categories: ["Programming", "Professional"],
        image: "assets/programming/ashey.png",
        description: "Personal portfolio website for my sister, showcasing her research work, publications, and professional accomplishments in computer science and computational biology.",
        tags: ["HTML", "CSS", "JavaScript", "2026"],
        link: "https://ashleymaeconard.com/",
        details: "Personal portfolio website for my sister, showcasing her research work, publications, and professional accomplishments in computer science and computational biology."
    },
    {
        id: 72,
        title: "OsTech Website",
        categories: ["Programming", "Professional"],
        image: "assets/programming/osTech.png",
        description: "Professional website for OsTech, a low voltage data infrastructure and audio/video solutions company. Features service pages, contact forms, and responsive design.",
        tags: ["HTML", "CSS", "JavaScript", "2025"],
        link: "https://larscon.github.io/oldProjects/OsTech/index.html",
        details: "Professional website for OsTech, a low voltage data infrastructure and audio/video solutions company. Features service pages, contact forms, and responsive design."
    },
    {
        id: 71,
        title: "Legends Flames Website",
        categories: ["Programming", "Professional"],
        image: "assets/programming/legendsflames.png",
        description: "Website for Legends Flames, a gaming and software development company. Created a modern, engaging web presence for the company.",
        tags: ["HTML", "CSS", "JavaScript", "2025"],
        link: "https://legendsflames.com/",
        details: "Website for Legends Flames, a gaming and software development company. Created a modern, engaging web presence for the company."
    },
    {
        id: 2,
        title: "Pick 3/4 Promotional Material",
        categories: ["Design", "Professional"],
        image: "assets/design/HTP_Pick3_V3.gif",
        description: "During my time at IGT, I worked with the Caribbean Lottery to create promotional material for their new game. It included videos on how to play, as well as POS advertising.",
        tags: ["Premiere Pro", "Illustrator", "Photoshop", "2024"],
        link: "https://drive.google.com/drive/folders/13wUwYgIMZff9vKxFdHzZIN50VhNa_0Q-?usp=drive_link",
        details: "During my time at IGT, I worked with the Caribbean Lottery to create promotional material for their new game. It included videos on how to play, as well as POS advertising."
    },
    {
        id: 3,
        title: "Caribbean Lottery Front of House",
        categories: ["Design", "Professional"],
        image: "assets/design/Caribbean-Lottery-Machine.png",
        description: "During my time at IGT, I worked with the Caribbean Lottery to create new visuals for their front of house and ticket machines.",
        tags: ["Illustrator", "Photoshop", "2024"],
        link: "https://drive.google.com/drive/folders/1o-dvjVktzGH9XsJgf-Kkkky-PfrQOzuO?usp=drive_link",
        details: "During my time at IGT, I worked with the Caribbean Lottery to create new visuals for their front of house and ticket machines."
    },
    {
        id: 4,
        title: "Retail Analysis Software Documentation",
        categories: ["Design", "Professional"],
        image: "assets/design/RMI.png",
        description: "During my time at IGT, I created a guide for reviewing retailer stores across the US.",
        tags: ["InDesign", "Photoshop", "2024"],
        link: "https://drive.google.com/file/d/1m0fHVEJ0rMoeJrFlKsxLd7HRH9cPUg8a/view?usp=sharing",
        details: "During my time at IGT, I created a guide for reviewing retailer stores across the US."
    },
    {
        id: 5,
        title: "2024 NSAC Plans Book",
        categories: ["Design", "Educational"],
        image: "assets/design/TideBook.png",
        description: "I lead a class in our participation of the 2024 National Student Advertising Competition, our client being Tide. I was the lead designer as well and created our plans book, alongside many other graphics. We produced a year long advertising campaign that included nearly all facets of media.",
        tags: ["Illustrator", "Photoshop", "Acrobat", "2024"],
        link: "https://drive.google.com/file/d/16guObY2g05zUmRFP2NnRgWwcBTy_rRJX/view?usp=drive_link",
        details: "I lead a class in our participation of the 2024 National Student Advertising Competition, our client being Tide. I was the lead designer as well and created our plans book, alongside many other graphics. We produced a year long advertising campaign that included nearly all facets of media."
    },
    {
        id: 6,
        title: "Golf Game",
        categories: ["Programming", "Educational"],
        image: "assets/programming/GolfGame.png",
        description: "This was my first project done in the Unreal game engine during my time in school at Indiana University.",
        tags: ["Unreal", "2024"],
        link: "https://tekatek.itch.io/golf-game",
        details: "This was my first project done in the Unreal game engine during my time in school at Indiana University."
    },
    {
        id: 7,
        title: "Express Cash Poster",
        categories: ["Design", "Professional"],
        image: "assets/IGT/Caribbean/ExpressCashPOS.png",
        description: "During my time at IGT, I worked with the Caribbean Lottery to create POS advertising material for their Express Cash game.",
        tags: ["Illustrator", "2024"],
        link: "#",
        details: "During my time at IGT, I worked with the Caribbean Lottery to create POS advertising material for their Express Cash game."
    },
    {
        id: 8,
        title: "2023 NSAC Plans Book",
        categories: ["Design", "Educational"],
        image: "assets/design/Portfolio.png",
        description: "I lead a class in our participation of the 2023 National Student Advertising Competition, our client being Indeed. I was the lead designer as well and created our plans book, alongside many other graphics. We produced a year long advertising campaign that included nearly all facets of media.",
        tags: ["Illustrator", "Photoshop", "Acrobat", "2023"],
        link: "https://drive.google.com/file/d/19SwMOOncnFkorIwDXdAINSc5ojcFegdO/view?usp=sharing",
        details: "I lead a class in our participation of the 2023 National Student Advertising Competition, our client being Indeed. I was the lead designer as well and created our plans book, alongside many other graphics. We produced a year long advertising campaign that included nearly all facets of media."
    },
    {
        id: 9,
        title: "Sigil of Formality",
        categories: ["Art", "Educational"],
        image: "assets/art/IMG_4250.jpg",
        description: "1/8 in laser cut birch adhered together made this piece.",
        tags: ["Rhino 7", "Illustrator", "2021"],
        link: "#",
        details: "1/8 in laser cut birch adhered together made this piece."
    },
    {
        id: 10,
        title: "Cyber Threats to NGOs Pamphlet",
        categories: ["Design", "Professional"],
        image: "assets/design/CyberThreats.png",
        description: "I helped in creating a pamphlet for the Cyber Threat Alliance.",
        tags: ["InDesign", "Illustrator", "2024"],
        link: "https://drive.google.com/file/d/1teLmTM3dNu_Y6ref6Bjc49kjLfuP9Kr0/view?usp=sharing",
        details: "I helped in creating a pamphlet for the Cyber Threat Alliance."
    },
    {
        id: 11,
        title: "Colonized",
        categories: ["Programming", "Educational"],
        image: "assets/programming/colonized.png",
        description: "This was done for completion of my final assignment in a class at Indiana University. Using Construct 3, we created games based on creating an aesthetic. I chose to do a horror-like space game!",
        tags: ["Construct 3", "2024"],
        link: "https://tekatek.itch.io/colonized",
        details: "This was done for completion of my final assignment in a class at Indiana University. Using Construct 3, we created games based on creating an aesthetic. I chose to do a horror-like space game!"
    },
    {
        id: 12,
        title: "Accounting Sheets Management App",
        categories: ["Programming", "Professional"],
        image: "assets/IGT/IGT/accountingPhoto.png",
        description: "This is an application, currently still under construction, to help retailers under IGT to manage their ticket sales.",
        tags: ["HTML", "CSS", "Javascript", "2024"],
        link: "https://larscon.github.io/oldProjects/AccountingSheetsWebApp/index.html",
        details: "This is an application, currently still under construction, to help retailers under IGT to manage their ticket sales."
    },
    {
        id: 13,
        title: "Timeless Retrace",
        categories: ["Programming", "Educational"],
        image: "assets/programming/CoverPhoto.png",
        description: "This is a product of a 48 hour game jam in a class at Indiana University. The theme was reverse, so we created a 2D platformer that takes you from space to the bronze age in thematic from level to level. I primarily did the Art/Animation, alongside helping in most other facets.",
        tags: ["Godot", "Illustrator", "2023"],
        link: "https://tekatek.itch.io/timeless-retrace",
        details: "This is a product of a 48 hour game jam in a class at Indiana University. The theme was reverse, so we created a 2D platformer that takes you from space to the bronze age in thematic from level to level. I primarily did the Art/Animation, alongside helping in most other facets."
    },
    {
        id: 14,
        title: "Infectious Disease Simulation Programming",
        categories: ["Engineering", "Educational"],
        image: "assets/engineering/infectious.png",
        description: "I was curious how Covid fared to other recent pandemics, was it more dangerous and effective than them? I used Python to simulate infectious disease models, writing a research paper on my findings.",
        tags: ["Python", "2024"],
        link: "https://drive.google.com/file/d/15rv25gy9gm0U8BgU-DgQijDROrghyuvF/view?usp=sharing",
        details: "I was curious how Covid fared to other recent pandemics, was it more dangerous and effective than them? I used Python to simulate infectious disease models, writing a research paper on my findings."
    },
    {
        id: 15,
        title: "Poster Project",
        categories: ["Design", "Educational"],
        image: "assets/design/Poster.png",
        description: "I created a poster for classwork, but also to creatively publicize to my friend group when we are to have another DND meetup!",
        tags: ["Illustrator", "2023"],
        link: "#",
        details: "I created a poster for classwork, but also to creatively publicize to my friend group when we are to have another DND meetup!"
    },
    {
        id: 16,
        title: "OCT Wireframe",
        categories: ["Programming", "Recreational"],
        image: "assets/design/portfolio_wireframe.png",
        description: "A wireframe I created for an online card trading platform website concept.",
        tags: ["Illustrator", "2021"],
        link: "https://drive.google.com/file/d/1MLRtfz3bPNkbDtaqowjb6koK7UvmrF1s/view?usp=sharing",
        details: "A wireframe I created for an online card trading platform website concept."
    },
    {
        id: 17,
        title: "Roe vs Wade Landing Page",
        categories: ["Programming", "Professional"],
        image: "assets/programming/roe.jpg",
        description: "The landing page for Roe vs Wade coverage I created for the IDS (Indiana Daily Student).",
        tags: ["HTML", "CSS", "Javascript", "2022"],
        link: "https://specials.idsnews.com/indiana-roe-wade-abortion-explained/",
        details: "The landing page for Roe vs Wade coverage I created for the IDS (Indiana Daily Student)."
    },
    {
        id: 18,
        title: "Steampunk Ornithopter",
        categories: ["Art", "Educational"],
        image: "assets/art/IMG_4260.jpg",
        description: "Inspired by works from Magic The Gathering, I drew a mechanical flying machine.",
        tags: ["2021"],
        link: "#",
        details: "Inspired by works from Magic The Gathering, I drew a mechanical flying machine."
    },
    {
        id: 19,
        title: "Tide Animation",
        categories: ["Design", "Educational"],
        image: "assets/design/Swirl.gif",
        description: "For the National Student Advertising Competition 2024, I created a logo animation to help our mobile advertisements end on a similar note.",
        tags: ["After Effects", "2024"],
        link: "#",
        details: "For the National Student Advertising Competition 2024, I created a logo animation to help our mobile advertisements end on a similar note."
    },
    {
        id: 20,
        title: "Indeed Logo Animation",
        categories: ["Design", "Educational"],
        image: "assets/design/IndeedAnimGif.gif",
        description: "For the National Student Advertising Competition, I created a logo animation to help our mobile advertisements end on a similar note.",
        tags: ["After Effects", "2023"],
        link: "#",
        details: "For the National Student Advertising Competition, I created a logo animation to help our mobile advertisements end on a similar note."
    },
    {
        id: 21,
        title: "My 3D Printer",
        categories: ["Engineering", "Recreational"],
        image: "assets/engineering/printers.png",
        description: "My heavily custom upgraded FDM 3D printer, and SLS 3D printer (plastic and resin)!",
        tags: [],
        link: "#",
        details: "My heavily custom upgraded FDM 3D printer, and SLS 3D printer (plastic and resin)!"
    },
    {
        id: 22,
        title: "Graduation Photography",
        categories: ["Photography", "Recreational"],
        image: "assets/photography/IMG_0140.jpg",
        description: "For my sister's graduation from Brown, I was her personal photographer! This was my favorite shot.",
        tags: ["Canon EOS M200", "2021"],
        link: "#",
        details: "For my sister's graduation from Brown, I was her personal photographer! This was my favorite shot."
    },
    {
        id: 23,
        title: "Portraiture",
        categories: ["Art", "Educational"],
        image: "assets/art/IMG_4069.jpg",
        description: "I drew a classmate in profile view.",
        tags: ["2021"],
        link: "#",
        details: "I drew a classmate in profile view."
    },
    {
        id: 24,
        title: "Survey Poster",
        categories: ["Design", "Educational"],
        image: "assets/design/PortfolioPic.png",
        description: "I created posters and ads to collect survey data for the 2024 National Student Advertising Competition",
        tags: ["Illustrator", "2023"],
        link: "#",
        details: "I created posters and ads to collect survey data for the 2024 National Student Advertising Competition"
    },
    {
        id: 25,
        title: "3D Maze Game",
        categories: ["Programming", "Educational"],
        image: "assets/programming/cover1.png",
        description: "This was a project done during my time at Indiana University as an introduction to 3D games.",
        tags: ["Godot", "2023"],
        link: "#",
        details: "This was a project done during my time at Indiana University as an introduction to 3D games."
    },
    {
        id: 26,
        title: "Timeless Retrace Sprite Sheet",
        categories: ["Design", "Educational"],
        image: "assets/programming/assets.jpg",
        description: "This is a product of a 48 hour game jam in a class at Indiana University. The theme was reverse, so we created a 2D platformer that takes you from space to the bronze age in thematic from level to level. I primarily did the Art/Animation, alongside helping in all other facets.",
        tags: ["Illustrator", "Godot", "2023"],
        link: "#",
        details: "This is a product of a 48 hour game jam in a class at Indiana University. The theme was reverse, so we created a 2D platformer that takes you from space to the bronze age in thematic from level to level. I primarily did the Art/Animation, alongside helping in all other facets."
    },
    {
        id: 27,
        title: "Magazine Mock Up",
        categories: ["Design", "Educational"],
        image: "assets/design/Magazine.png",
        description: "I created a short concept magazine for classwork, text was provided.",
        tags: ["InDesign", "2023"],
        link: "#",
        details: "I created a short concept magazine for classwork, text was provided."
    },
    {
        id: 28,
        title: "Fall Bridge",
        categories: ["Photography", "Recreational"],
        image: "assets/photography/IMG_0375.jpg",
        description: "Griffy Lake in Bloomington Indiana during the fall is a beautiful place, had to take a few snapshots!",
        tags: ["Canon EOS M200", "2022"],
        link: "#",
        details: "Griffy Lake in Bloomington Indiana during the fall is a beautiful place, had to take a few snapshots!"
    },
    {
        id: 29,
        title: "Waveform Animation",
        categories: ["Design", "Educational"],
        image: "assets/design/ezgif-3-3441fb70f3.gif",
        description: "For our National Student Advertising Competition presentation, I created a waveform animation to help illustrate an audio ad our team created.",
        tags: ["After Effects", "2023"],
        link: "#",
        details: "For our National Student Advertising Competition presentation, I created a waveform animation to help illustrate an audio ad our team created."
    },
    {
        id: 30,
        title: "Photo of my Dog",
        categories: ["Photography", "Recreational"],
        image: "assets/photography/IMG_0388.jpg",
        description: "Out of the many professionally photographed images I have of my favorite animal (Spot), this is a personal favorite",
        tags: ["Canon EOS M200", "2022"],
        link: "#",
        details: "Out of the many professionally photographed images I have of my favorite animal (Spot), this is a personal favorite"
    },
    {
        id: 31,
        title: "Framing Interactive Art Pieces",
        categories: ["Engineering", "Professional"],
        image: "assets/engineering/IMG-4821.jpg",
        description: "Conceptualizing framing the hardware to run interactive art pieces.",
        tags: ["Windows", "2022"],
        link: "#",
        details: "Conceptualizing framing the hardware to run interactive art pieces."
    },
    {
        id: 32,
        title: "Mead Bottle Label",
        categories: ["Design", "Recreational"],
        image: "assets/design/homemademeadlabel.png",
        description: "A bottle wrap I created for mead I created.",
        tags: ["Illustrator", "2019"],
        link: "#",
        details: "A bottle wrap I created for mead I created."
    },
    {
        id: 33,
        title: "Brick Breaker Game",
        categories: ["Programming", "Educational"],
        image: "assets/programming/cover.png",
        description: "This was a project done during my time at Indiana University as an introduction to tweening.",
        tags: ["Godot", "2023"],
        link: "https://tekatek.itch.io/brick-breaker",
        details: "This was a project done during my time at Indiana University as an introduction to tweening."
    },
    {
        id: 34,
        title: "Concept Infographics Page",
        categories: ["Design", "Educational"],
        image: "assets/design/ConardLars_NatalieAustin_Infographic-1-1.png",
        description: "Concept infographics page created for classwork.",
        tags: ["Illustrator", "InDesign", "2023"],
        link: "https://drive.google.com/file/d/1sTc1awlQi0gjh3kNJsItV0MoPdNdOtwo/view?usp=sharing",
        details: "Concept infographics page created for classwork."
    },
    {
        id: 35,
        title: "Arduino Rover",
        categories: ["Engineering", "Recreational"],
        image: "assets/engineering/IMG_4279.jpg",
        description: "Arduino-based rover project demonstrating robotics and electronics skills.",
        tags: ["Arduino", "2020"],
        link: "#",
        details: "Arduino-based rover project demonstrating robotics and electronics skills."
    },
    {
        id: 36,
        title: "Newspaper Front Page",
        categories: ["Design", "Educational"],
        image: "assets/design/Newspaper.png",
        description: "Newspaper front page design project.",
        tags: ["InDesign", "2023"],
        link: "#",
        details: "Newspaper front page design project."
    },
    {
        id: 37,
        title: "Skeleton with Cloth",
        categories: ["Art", "Educational"],
        image: "assets/art/65532310101__829FA6AF-2165-4913-9981-8B337B2C2C09.jpg",
        description: "Skeleton drawing with cloth study.",
        tags: ["2020"],
        link: "#",
        details: "Skeleton drawing with cloth study."
    },
    {
        id: 38,
        title: "Tree Service Logo",
        categories: ["Design", "Professional"],
        image: "assets/design/1.png",
        description: "Tree service logo design project.",
        tags: ["Illustrator", "2017"],
        link: "#",
        details: "Tree service logo design project."
    },
    {
        id: 39,
        title: "Photo of Ukrainian Student",
        categories: ["Photography", "Educational"],
        image: "assets/photography/IMG_0215.jpg",
        description: "Photograph of Ukrainian student.",
        tags: ["2022"],
        link: "#",
        details: "Photograph of Ukrainian student."
    },
    {
        id: 40,
        title: "Rendered Donut",
        categories: ["Design", "Educational"],
        image: "assets/design/IMG-5513.png",
        description: "3D rendered donut created in Blender.",
        tags: ["Blender", "2023"],
        link: "#",
        details: "3D rendered donut created in Blender."
    },
    {
        id: 41,
        title: "NFT Project",
        categories: ["Art", "Recreational"],
        image: "assets/art/IMG_4135.jpg",
        description: "NFT art project exploring digital ownership.",
        tags: ["2021"],
        link: "#",
        details: "NFT art project exploring digital ownership."
    },
    {
        id: 42,
        title: "3D Printed Lithophanes",
        categories: ["Engineering", "Recreational"],
        image: "assets/engineering/unnamed (4).jpg",
        description: "3D printed lithophanes created using custom 3D printer.",
        tags: ["2020"],
        link: "#",
        details: "3D printed lithophanes created using custom 3D printer."
    },
    {
        id: 43,
        title: "My Custom CNC Machine",
        categories: ["Engineering", "Recreational"],
        image: "assets/engineering/unnamed (2).jpg",
        description: "Custom CNC machine built from scratch demonstrating mechanical engineering skills.",
        tags: ["CNC"],
        link: "#",
        details: "Custom CNC machine built from scratch demonstrating mechanical engineering skills."
    },
    {
        id: 44,
        title: "Appetite Ad Agency Logo Submission",
        categories: ["Design", "Educational"],
        image: "assets/design/Appetite.png",
        description: "Logo submission for Appetite Ad Agency competition.",
        tags: ["Illustrator", "2023"],
        link: "#",
        details: "Logo submission for Appetite Ad Agency competition."
    },
    {
        id: 45,
        title: "My Personal Computer",
        categories: ["Engineering", "Recreational"],
        image: "assets/engineering/unnamed (1).jpg",
        description: "Custom built personal computer showcasing hardware knowledge.",
        tags: [],
        link: "#",
        details: "Custom built personal computer showcasing hardware knowledge."
    },
    {
        id: 46,
        title: "Interstellar Corvette",
        categories: ["Design", "Educational"],
        image: "assets/design/interstellar_corvette.jpg",
        description: "Interstellar Corvette digital artwork.",
        tags: ["2017"],
        link: "#",
        details: "Interstellar Corvette digital artwork."
    },
    {
        id: 47,
        title: "My Old Portfolio",
        categories: ["Programming", "Educational"],
        image: "assets/programming/port.jpg",
        description: "Previous version of my portfolio website.",
        tags: ["HTML", "CSS", "JavaScript", "2018"],
        link: "#",
        details: "Previous version of my portfolio website."
    },
    {
        id: 48,
        title: "Forge Ball Digital Painting",
        categories: ["Design", "Educational"],
        image: "assets/design/copy.png",
        description: "Digital painting of a forge ball created in Photoshop.",
        tags: ["Photoshop", "2017"],
        link: "#",
        details: "Digital painting of a forge ball created in Photoshop."
    },
    {
        id: 49,
        title: "Insect Photography",
        categories: ["Photography", "Recreational"],
        image: "assets/photography/IMG_0340.jpg",
        description: "Macro photography of insects showcasing nature photography skills.",
        tags: ["Canon EOS M200", "2022"],
        link: "#",
        details: "Macro photography of insects showcasing nature photography skills."
    },
    {
        id: 50,
        title: "NCAA NIL Changes Concept Article",
        categories: ["Programming", "Educational"],
        image: "assets/programming/story.png",
        description: "Concept article about NCAA NIL changes designed in InDesign.",
        tags: ["InDesign", "2022"],
        link: "#",
        details: "Concept article about NCAA NIL changes designed in InDesign."
    },
    {
        id: 51,
        title: "Colored Skull",
        categories: ["Art", "Educational"],
        image: "assets/art/IMG_4044.jpg",
        description: "Colored skull artwork demonstrating anatomy and color theory.",
        tags: ["2021"],
        link: "#",
        details: "Colored skull artwork demonstrating anatomy and color theory."
    },
    {
        id: 52,
        title: "Squirrel in Tree",
        categories: ["Photography", "Educational"],
        image: "assets/photography/IMG_0186.jpg",
        description: "Photograph of a squirrel in a tree showcasing wildlife photography.",
        tags: ["Canon EOS M200", "2022"],
        link: "#",
        details: "Photograph of a squirrel in a tree showcasing wildlife photography."
    },
    {
        id: 53,
        title: "Multi PC Testing Setup",
        categories: ["Engineering", "Professional"],
        image: "assets/engineering/IMG-4817.jpg",
        description: "Multi PC testing setup for software development and quality assurance.",
        tags: ["2022"],
        link: "#",
        details: "Multi PC testing setup for software development and quality assurance."
    },
    {
        id: 54,
        title: "LCD Logo",
        categories: ["Design", "Recreational"],
        image: "assets/design/LCD_Cube.png",
        description: "LCD logo design created in Illustrator.",
        tags: ["Illustrator", "2015"],
        link: "#",
        details: "LCD logo design created in Illustrator."
    },
    {
        id: 55,
        title: "My Gaming Logo",
        categories: ["Design", "Recreational"],
        image: "assets/design/tek.png",
        description: "Personal gaming logo design for streaming and gaming content.",
        tags: ["Illustrator", "2017"],
        link: "#",
        details: "Personal gaming logo design for streaming and gaming content."
    },
    {
        id: 56,
        title: "Tom's of Maine Concept Page",
        categories: ["Programming", "Educational"],
        image: "assets/programming/toms.jpg",
        description: "Concept page design for Tom's of Maine brand.",
        tags: ["HTML", "CSS", "JavaScript", "2022"],
        link: "#",
        details: "Concept page design for Tom's of Maine brand."
    },
    {
        id: 57,
        title: "Twitch Offline Screen",
        categories: ["Design", "Recreational"],
        image: "assets/design/offline.png",
        description: "Twitch offline screen design for streaming channel.",
        tags: ["Illustrator", "2017"],
        link: "#",
        details: "Twitch offline screen design for streaming channel."
    },
    {
        id: 58,
        title: "A gloomy road",
        categories: ["Photography", "Recreational"],
        image: "assets/photography/IMG_0451.jpg",
        description: "Photograph of a gloomy road capturing atmospheric mood.",
        tags: ["Canon EOS M200", "2022"],
        link: "#",
        details: "Photograph of a gloomy road capturing atmospheric mood."
    },
    {
        id: 59,
        title: "Sharesoft Logo",
        categories: ["Design", "Recreational"],
        image: "assets/design/sharesoft.png",
        description: "Logo design for Sharesoft software company.",
        tags: ["Illustrator", "2017"],
        link: "#",
        details: "Logo design for Sharesoft software company."
    },
    {
        id: 60,
        title: "My Mechanical Self",
        categories: ["Art", "Educational"],
        image: "assets/art/IMG_4581.jpg",
        description: "Self-portrait created in mechanical art style.",
        tags: ["2020"],
        link: "#",
        details: "Self-portrait created in mechanical art style."
    },
    {
        id: 61,
        title: "Local Coffee Shop",
        categories: ["Photography", "Educational"],
        image: "assets/photography/IMG_0320.jpg",
        description: "Photograph of a local coffee shop showcasing street photography.",
        tags: ["Canon EOS M200", "2022"],
        link: "#",
        details: "Photograph of a local coffee shop showcasing street photography."
    },
    {
        id: 62,
        title: "Twitch Starting Screen",
        categories: ["Design", "Recreational"],
        image: "assets/design/starting.png",
        description: "Twitch starting screen design for streaming channel.",
        tags: ["Illustrator", "2016"],
        link: "#",
        details: "Twitch starting screen design for streaming channel."
    },
    {
        id: 63,
        title: "Conard Crest",
        categories: ["Design", "Recreational"],
        image: "assets/design/23.png",
        description: "Personal family crest design for the Conard family.",
        tags: ["Illustrator", "2016"],
        link: "#",
        details: "Personal family crest design for the Conard family."
    },
    {
        id: 64,
        title: "LC Designs Logo",
        categories: ["Design", "Recreational"],
        image: "assets/design/lc_geo.png",
        description: "LC Designs business logo for design services.",
        tags: ["Illustrator", "2017"],
        link: "#",
        details: "LC Designs business logo for design services."
    },
    {
        id: 65,
        title: "Gentle Family Dentistry Logo",
        categories: ["Design", "Professional"],
        image: "assets/design/gfd.png",
        description: "Logo design for Gentle Family Dentistry practice.",
        tags: ["Illustrator", "2018"],
        link: "#",
        details: "Logo design for Gentle Family Dentistry practice."
    },
    {
        id: 66,
        title: "Tree Service Logo Mock Up",
        categories: ["Design", "Professional"],
        image: "assets/design/2.png",
        description: "Tree service logo mock up design.",
        tags: ["Illustrator", "2017"],
        link: "#",
        details: "Tree service logo mock up design."
    },
    {
        id: 67,
        title: "Atlas on a rainy day",
        categories: ["Photography", "Recreational"],
        image: "assets/photography/IMG_0447.jpg",
        description: "Photograph of Atlas (apartment complex) on a rainy day.",
        tags: ["Canon EOS M200", "2022"],
        link: "#",
        details: "Photograph of Atlas (apartment complex) on a rainy day."
    },
    {
        id: 68,
        title: "Charcuterie Board",
        categories: ["Art", "Educational"],
        image: "assets/art/IMG_3919.jpg",
        description: "Photograph of a beautifully arranged charcuterie board.",
        tags: ["Canon EOS M200", "2022"],
        link: "#",
        details: "Photograph of a beautifully arranged charcuterie board."
    },
    {
        id: 69,
        title: "Twitch.TV Graphics",
        categories: ["Design", "Recreational"],
        image: "assets/design/meta_.png",
        description: "Complete Twitch.TV streaming graphics package including overlays and alerts.",
        tags: ["Illustrator", "2016"],
        link: "#",
        details: "Complete Twitch.TV streaming graphics package including overlays and alerts."
    },
    {
        id: 70,
        title: "Concept Logo",
        categories: ["Design", "Recreational"],
        image: "assets/design/logo redone.png",
        description: "Concept logo design exploring different branding approaches.",
        tags: ["Illustrator", "2020"],
        link: "#",
        details: "Concept logo design exploring different branding approaches."
    }
];
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    cube = document.querySelector('.cube');
    cubeContainer = document.querySelector('.cube-container');
    frontFace = document.querySelector('#front-face');
    hamburger = document.querySelector('.hamburger');
    navMenu = document.querySelector('.nav-menu');
    navLinks = document.querySelectorAll('.nav-link');
    timelineItems = document.querySelectorAll('.timeline-item');
    filterBtns = document.querySelectorAll('.filter-btn');
    portfolioGrid = document.querySelector('#portfolio-grid');
    modal = document.querySelector('#portfolio-modal');
    modalContent = document.querySelector('.modal-content');
    closeModal = document.querySelector('.close');
    contactForm = document.querySelector('#contact-form');

    // Initialize all functions
    initializeCube();
    initializeNavigation();
    initializeTimeline();
    initializeAccordion(); // <-- ensure this is called
    initializePortfolio();
    initializeModal();
    initializeContactForm();

    // Add event listeners for related portfolio work (after accordion is rendered)
    addRelatedPortfolioListeners();
});

function addRelatedPortfolioListeners() {
    // Find all related portfolio containers
    const relatedContainers = document.querySelectorAll('.related-portfolio');
    relatedContainers.forEach(container => {
        const list = container.querySelector('ul');
        if (!list) {
            // If no list, remove the entire section
            container.parentNode.removeChild(container);
            return;
        }
        // Replace list with horizontal image cards
        const items = Array.from(list.querySelectorAll('li'));
        let hasValid = false;
        const newDiv = document.createElement('div');
        newDiv.className = 'related-portfolio-row';
        items.forEach(li => {
            const link = li.querySelector('a');
            if (!link) return;
            const id = parseInt(link.getAttribute('data-portfolio-id'));
            const item = findPortfolioItem(id);
            if (!item) return;
            hasValid = true;
            // Create card
            const card = document.createElement('div');
            card.className = 'related-portfolio-card';
            card.setAttribute('data-id', id);
            card.innerHTML = `
                <div class="related-portfolio-image"><img src="${item.image}" alt="${item.title}"></div>
                <div class="related-portfolio-title">${item.title}</div>
            `;
            card.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(item);
            });
            newDiv.appendChild(card);
        });
        if (!hasValid) {
            // No valid related items, remove the section
            container.parentNode.removeChild(container);
        } else {
            // Replace old list with new row
            list.parentNode.replaceChild(newDiv, list);
        }
    });
}

// Cube Animation
function initializeCube() {
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;
    let animationFrame;
    let isMouseOver = true;
    let isSpinning = false;
    let savedTargetX = 0;
    let savedTargetY = 0;

    let funFaces = ["O.O", ":P", "o.O", ":D", ":3", ";]", ":') ", "^_^", ":O", ":|", ":]"];
    shuffleArray(funFaces);
    let funFaceIndex = 0;

    function animateCube() {
        currentRotationX += (targetRotationX - currentRotationX) * 0.12;
        currentRotationY += (targetRotationY - currentRotationY) * 0.12;
        cube.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
        animationFrame = requestAnimationFrame(animateCube);
    }

    function onMouseMove(e) {
        if (!cubeContainer || isSpinning) return;
        const cubeRect = cubeContainer.getBoundingClientRect();
        const cubeCenterX = cubeRect.left + cubeRect.width / 2;
        const cubeCenterY = cubeRect.top + cubeRect.height / 2;
        const deltaX = e.clientX - cubeCenterX;
        const deltaY = e.clientY - cubeCenterY;
        targetRotationY = deltaX / cubeRect.width * 22.5;
        targetRotationX = -deltaY / cubeRect.height * 22.5;
        // Clamp to ±80 degrees
        targetRotationY = Math.max(-80, Math.min(80, targetRotationY));
        targetRotationX = Math.max(-80, Math.min(80, targetRotationX));
    }

    // Only the front face has a smiley, others are blank
    if (frontFace) frontFace.textContent = ':)';
    const faces = cube ? cube.querySelectorAll('.face') : [];
    faces.forEach(face => {
        if (face !== frontFace) face.textContent = '';
    });

    // Mouse enter/leave for smile/frown
    document.addEventListener('mouseenter', () => {
        isMouseOver = true;
        if (!isSpinning && frontFace) frontFace.textContent = ':)';
    });
    document.addEventListener('mouseleave', () => {
        isMouseOver = false;
        if (!isSpinning && frontFace) frontFace.textContent = ':(';
    });

    // Easing function for smooth ease-out
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    cube.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;
        savedTargetX = targetRotationX;
        savedTargetY = targetRotationY;
        let startY = targetRotationY;
        let endY = startY + 360;
        let spinDuration = 400;
        let spinBackDuration = 500;
        let pauseDuration = 1000;
        let startTime = null;
        let faceChanged = false;
        // Get next face in shuffled list
        let funFace = funFaces[funFaceIndex];
        funFaceIndex = (funFaceIndex + 1) % funFaces.length;

        function spinStep(ts) {
            if (!startTime) startTime = ts;
            let progress = Math.min((ts - startTime) / spinDuration, 1);
            let eased = easeOutCubic(progress);
            targetRotationY = startY + (endY - startY) * eased;
            // Change face at about 60% progress (visually matches 180°)
            if (!faceChanged && progress >= 0.6) {
                if (frontFace) frontFace.textContent = funFace;
                faceChanged = true;
            }
            if (progress < 1) {
                requestAnimationFrame(spinStep);
            } else {
                setTimeout(() => {
                    let spinBackStart = null;
                    let backFaceChanged = false;
                    let spinBackStartY = targetRotationY;
                    let spinBackEndY = savedTargetY;
                    function spinBackStep(ts2) {
                        if (!spinBackStart) spinBackStart = ts2;
                        let progress2 = Math.min((ts2 - spinBackStart) / spinBackDuration, 1);
                        let eased2 = easeOutCubic(progress2);
                        targetRotationY = spinBackStartY + (spinBackEndY - spinBackStartY) * eased2;
                        // Change face back at about 60% progress
                        if (!backFaceChanged && progress2 >= 0.6) {
                            if (frontFace) frontFace.textContent = isMouseOver ? ':)' : ':(';
                            backFaceChanged = true;
                        }
                        if (progress2 < 1) {
                            requestAnimationFrame(spinBackStep);
                        } else {
                            isSpinning = false;
                        }
                    }
                    requestAnimationFrame(spinBackStep);
                }, pauseDuration);
            }
        }
        requestAnimationFrame(spinStep);
    });

    animateCube();
    document.addEventListener('mousemove', onMouseMove);
}

// Navigation
function initializeNavigation() {
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Only prevent default for internal links (anchors)
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
            // Always close mobile menu
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scrolling for hero buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const href = button.getAttribute('href');
            // Only prevent default for internal links (anchors)
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Active navigation link on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    });
}

// Timeline
function initializeTimeline() {
    timelineItems.forEach(item => {
        item.addEventListener('click', () => {
            // Toggle active state
            const isActive = item.classList.contains('active');

            // Remove active class from all items
            timelineItems.forEach(timelineItem => {
                timelineItem.classList.remove('active');
            });

            // Add active class to clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Accordion functionality for work experience and education
function initializeAccordion() {
    const experienceAccordion = document.getElementById('experience-accordion');
    const educationAccordion = document.getElementById('education-accordion');

    if (experienceAccordion) {
        const experienceItems = experienceAccordion.querySelectorAll('.accordion-item');
        const experienceHeaders = experienceAccordion.querySelectorAll('.accordion-header');

        experienceHeaders.forEach((header, idx) => {
            header.addEventListener('click', () => {
                experienceItems.forEach((item, i) => {
                    if (i === idx) {
                        const isOpen = item.classList.contains('open');
                        item.classList.toggle('open', !isOpen);
                        header.classList.toggle('active', !isOpen);
                    } else {
                        item.classList.remove('open');
                        experienceHeaders[i].classList.remove('active');
                    }
                });
            });
        });
    }

    if (educationAccordion) {
        const educationItems = educationAccordion.querySelectorAll('.accordion-item');
        const educationHeaders = educationAccordion.querySelectorAll('.accordion-header');

        educationHeaders.forEach((header, idx) => {
            header.addEventListener('click', () => {
                educationItems.forEach((item, i) => {
                    if (i === idx) {
                        const isOpen = item.classList.contains('open');
                        item.classList.toggle('open', !isOpen);
                        header.classList.toggle('active', !isOpen);
                    } else {
                        item.classList.remove('open');
                        educationHeaders[i].classList.remove('active');
                    }
                });
            });
        });
    }
}

// --- Filtering: Only one category at a time ---
function initializePortfolio() {
    renderPortfolioItems();

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            activeFilters.clear();
            activeFilters.add(filter);
            updateFilterButtonStates();
            renderPortfolioItems();
        });
    });
}

function updateFilterButtonStates() {
    filterBtns.forEach(btn => {
        const filter = btn.getAttribute('data-filter');
        if (filter === 'all') {
            btn.classList.toggle('active', activeFilters.has('all'));
        } else {
            btn.classList.toggle('active', activeFilters.has(filter));
        }
    });
}

// --- Responsive grid and View More ---
let itemsToShow = 12;
let showingAll = false;

function renderPortfolioItems() {
    const filter = Array.from(activeFilters)[0];
    let filteredItems = portfolioItems;
    if (filter && filter !== 'all') {
        filteredItems = portfolioItems.filter(item =>
            item.categories.map(c => c.toLowerCase()).includes(filter.toLowerCase())
        );
    }
    // Limit items if not showing all
    const items = showingAll ? filteredItems : filteredItems.slice(0, itemsToShow);
    portfolioGrid.innerHTML = items.map(item => `
        <div class="portfolio-item" data-id="${item.id}">
            <div class="portfolio-image">
                <img src="${item.image}" alt="${item.title}">
                <div class="portfolio-overlay">
                    <div class="portfolio-overlay-content">
                        <h3>${item.title}</h3>
                        <p>Click to view details</p>
                    </div>
                </div>
            </div>
            <div class="portfolio-content">
                <h3>${item.title}</h3>
                <div class="portfolio-categories">
                    ${item.categories.map(category => `<span class="portfolio-category">${category}</span>`).join('')}
                </div>
                <div class="portfolio-tags">
                    ${item.tags.map(tag => `<span class="portfolio-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
    // Add View More button if needed
    if (!showingAll && filteredItems.length > itemsToShow) {
        portfolioGrid.innerHTML += `<div class="portfolio-view-more"><button class="btn btn-primary" id="view-more-btn">View More</button></div>`;
        document.getElementById('view-more-btn').onclick = () => {
            showingAll = true;
            renderPortfolioItems();
        };
    }
    // Add click event listeners to portfolio items
    const portfolioItemElements = document.querySelectorAll('.portfolio-item');
    portfolioItemElements.forEach(item => {
        item.addEventListener('click', () => {
            const itemId = parseInt(item.getAttribute('data-id'));
            const portfolioItem = findPortfolioItem(itemId);
            openModal(portfolioItem);
        });
    });
}

// Modal
function initializeModal() {
    // Close modal when clicking the close button
    closeModal.addEventListener('click', closeModalFunction);

    // Close modal when clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunction();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModalFunction();
        }
    });
}

function openModal(portfolioItem) {
    const modalBody = document.querySelector('.modal-body');

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2>${portfolioItem.title}</h2>
        </div>
        <div class="modal-image">
            <img src="${portfolioItem.image}" alt="${portfolioItem.title}">
        </div>
        <div class="modal-details">
            <p>${portfolioItem.details}</p>
            <div class="modal-categories">
                ${portfolioItem.categories.map(category => `<span class="portfolio-category">${category}</span>`).join('')}
            </div>
            <div class="modal-tags">
                ${portfolioItem.tags.map(tag => `<span class="portfolio-tag">${tag}</span>`).join('')}
            </div>
            ${portfolioItem.link && portfolioItem.link !== '#' ? `<a href="${portfolioItem.link}" class="btn btn-primary" target="_blank">See Work</a>` : ''}
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModalFunction() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Contact Form
function initializeContactForm() {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        // Show loading state (optional)
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });
            if (response.ok) {
                // Replace form with thank you message
                form.outerHTML = `<div class="contact-success" style="text-align:center;padding:2rem 0;">
                    <div class="success-content">
                        <i class="fas fa-check-circle" style="font-size:3rem;color:#10b981;margin-bottom:1rem;"></i>
                        <h3>Message Sent!</h3>
                        <p>Thank you for reaching out. I'll get back to you soon!</p>
                    </div>
                </div>`;
            } else {
                throw new Error('Submission failed');
            }
        } catch (err) {
            // Show error message
            form.outerHTML = `<div class="contact-success" style="text-align:center;padding:2rem 0;">
                <div class="success-content">
                    <i class="fas fa-exclamation-circle" style="font-size:3rem;color:#e53e3e;margin-bottom:1rem;"></i>
                    <h3>Something went wrong</h3>
                    <p>Sorry, your message could not be sent. Please try again later or email me directly.</p>
                </div>
            </div>`;
        }
    });
}

function showContactSuccess() {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'contact-success';
    successMessage.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>Message Sent!</h3>
            <p>Thank you for reaching out. I'll get back to you soon!</p>
        </div>
    `;

    // Add styles
    successMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        z-index: 3000;
        text-align: center;
    `;

    successMessage.querySelector('.success-content i').style.cssText = `
        font-size: 3rem;
        color: #10b981;
        margin-bottom: 1rem;
    `;

    document.body.appendChild(successMessage);

    // Remove after 3 seconds
    setTimeout(() => {
        document.body.removeChild(successMessage);
    }, 3000);
}

// Utility function to find portfolio item by ID
function findPortfolioItem(id) {
    return portfolioItems.find(item => item.id === id);
}

// Utility: Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}