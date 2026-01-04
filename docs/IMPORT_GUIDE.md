# WordPress Import Guide for About Page Setup

## 📂 Files Overview

This folder contains all the JSON exports you need to set up the About page functionality:

- `skills-cpt.json` - Skills Custom Post Type
- `hobbies-cpt.json` - Hobbies Custom Post Type  
- `skills-acf-fields.json` - ACF fields for Skills CPT
- `hobbies-acf-fields.json` - ACF fields for Hobbies CPT
- `about-page-acf-fields.json` - ACF fields for About page

## 🚀 Import Instructions

### Step 1: Install Required Plugins

Make sure you have these plugins installed:
- **Advanced Custom Fields PRO** (required for post object fields)
- **WPGraphQL** 
- **WPGraphQL for Advanced Custom Fields**

### Step 2: Import Custom Post Types

#### Option A: Using Custom Post Type UI Plugin (Recommended)
1. Install and activate **Custom Post Type UI** plugin
2. Go to **CPT UI > Tools > Import/Export**
3. Click **Import Post Types**
4. Copy the content from `skills-cpt.json` and paste it
5. Click **Import**
6. Repeat for `hobbies-cpt.json`

#### Option B: Manual Code Method
If you prefer to add via code, add this to your theme's `functions.php`:

```php
// Skills CPT
function create_skills_cpt() {
    register_post_type('skill', [
        'labels' => [
            'name' => 'Skills',
            'singular_name' => 'Skill',
            'menu_name' => 'Skills',
            'add_new_item' => 'Add New Skill',
        ],
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'skill',
        'graphql_plural_name' => 'skills',
        'supports' => ['title', 'editor', 'thumbnail'],
        'menu_icon' => 'dashicons-star-filled',
        'menu_position' => 25,
    ]);
}
add_action('init', 'create_skills_cpt');

// Hobbies CPT
function create_hobbies_cpt() {
    register_post_type('hobby', [
        'labels' => [
            'name' => 'Hobbies',
            'singular_name' => 'Hobby',
            'menu_name' => 'Hobbies',
            'add_new_item' => 'Add New Hobby',
        ],
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'hobby',
        'graphql_plural_name' => 'hobbies',
        'supports' => ['title', 'editor', 'thumbnail'],
        'menu_icon' => 'dashicons-heart',
        'menu_position' => 26,
    ]);
}
add_action('init', 'create_hobbies_cpt');
```

### Step 3: Import ACF Field Groups

1. Go to **Custom Fields > Tools**
2. In the **Import Field Groups** section
3. For each JSON file (`skills-acf-fields.json`, `hobbies-acf-fields.json`, `about-page-acf-fields.json`):
   - Copy the entire content of the JSON file
   - Paste it into the import textarea
   - Click **Import Field Groups**

### Step 4: Refresh Permalinks

1. Go to **Settings > Permalinks**
2. Click **Save Changes** (this refreshes the rewrite rules)

### Step 5: Create Sample Content

#### Skills:
1. Go to **Skills > Add New**
2. Create some skills:
   - **React** - "A JavaScript library for building user interfaces"
   - **Next.js** - "React framework for production-grade applications"
   - **TypeScript** - "JavaScript with syntax for types"
   - **WordPress** - "Content management system and headless CMS"
   - **SCSS** - "CSS preprocessor with advanced features"
   - **GraphQL** - "Query language for APIs"

#### Hobbies:
1. Go to **Hobbies > Add New**
2. Create some hobbies:
   - **Reading** - "Enjoying books on technology, philosophy, and fiction"
   - **Photography** - "Capturing moments and exploring creative composition"
   - **Gaming** - "Playing strategy and adventure games"
   - **Hiking** - "Exploring nature and staying active outdoors"
   - **Cooking** - "Experimenting with new recipes and cuisines"

### Step 6: Set Up About Page

1. Go to **Pages > About** (or create if it doesn't exist)
2. You should now see the **About Page Fields** section with tabs:
   - **Hero Section**: Add title, subtitle, and hero image
   - **Experience Section**: Add your work experience
   - **Skills Section**: Select skills from the dropdown
   - **Personal Section**: Add personal content, image, and select hobbies

### Step 7: Test GraphQL

1. Go to **GraphQL > GraphiQL IDE**
2. Test this query:

```graphql
query GetAboutPage {
  page(id: "about", idType: URI) {
    title
    content
    aboutPageFields {
      aboutHeroTitle
      aboutHeroSubtitle
      skillsSection {
        sectionTitle
        selectedSkills {
          ... on Skill {
            id
            title
            skillFields {
              shortDescription
            }
          }
        }
      }
      personalSection {
        selectedHobbies {
          ... on Hobby {
            id
            title
            hobbyFields {
              description
            }
          }
        }
      }
    }
  }
}
```

## ✅ Verification Checklist

- [ ] Skills CPT created and visible in admin
- [ ] Hobbies CPT created and visible in admin
- [ ] Skills ACF fields working (short description field)
- [ ] Hobbies ACF fields working (description field)
- [ ] About Page ACF fields visible with all tabs
- [ ] Can select skills and hobbies in About page
- [ ] GraphQL query returns expected data
- [ ] Next.js app displays the content correctly

## 🔧 Troubleshooting

### Issue: Post Object fields not showing options
- Make sure you have **ACF PRO** (post object field requires PRO)
- Ensure Skills/Hobbies CPTs are published and public

### Issue: GraphQL fields not appearing
- Verify **WPGraphQL for Advanced Custom Fields** is installed
- Check that `show_in_graphql` is enabled for CPTs and ACF fields

### Issue: Next.js app not displaying data
- Check browser console for GraphQL errors
- Verify your WordPress GraphQL endpoint is accessible
- Ensure environment variables are correctly set

## 🎯 Next Steps

After successful import:
1. Add your personal content to the About page
2. Create your skills and hobbies
3. Select them in the About page fields
4. The Next.js app will automatically fetch and display the content!

## 📞 Support

If you encounter issues:
1. Check the WordPress error logs
2. Verify plugin versions are up to date
3. Test GraphQL queries in the GraphiQL IDE
4. Ensure all required plugins are activated