# Manual WordPress Setup Guide - No Import Needed

Since the JSON imports are causing issues, let's set everything up manually. This is actually more reliable and gives you better control.

## Step 1: Add Custom Post Types via Functions.php

1. Go to **Appearance > Theme Editor** (or edit via FTP/cPanel)
2. Open **functions.php**
3. Add this code at the end (before the closing `?>` if it exists):

```php
// Register Skills Custom Post Type
function create_skills_cpt() {
    $labels = array(
        'name' => 'Skills',
        'singular_name' => 'Skill',
        'menu_name' => 'Skills',
        'add_new_item' => 'Add New Skill',
        'edit_item' => 'Edit Skill',
        'view_item' => 'View Skill',
        'all_items' => 'All Skills',
        'search_items' => 'Search Skills',
        'not_found' => 'No skills found.',
        'not_found_in_trash' => 'No skills found in Trash.',
    );

    $args = array(
        'labels' => $labels,
        'public' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'skill',
        'graphql_plural_name' => 'skills',
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-star-filled',
        'menu_position' => 25,
    );

    register_post_type('skill', $args);
}
add_action('init', 'create_skills_cpt');

// Register Hobbies Custom Post Type
function create_hobbies_cpt() {
    $labels = array(
        'name' => 'Hobbies',
        'singular_name' => 'Hobby',
        'menu_name' => 'Hobbies',
        'add_new_item' => 'Add New Hobby',
        'edit_item' => 'Edit Hobby',
        'view_item' => 'View Hobby',
        'all_items' => 'All Hobbies',
        'search_items' => 'Search Hobbies',
        'not_found' => 'No hobbies found.',
        'not_found_in_trash' => 'No hobbies found in Trash.',
    );

    $args = array(
        'labels' => $labels,
        'public' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'hobby',
        'graphql_plural_name' => 'hobbies',
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-heart',
        'menu_position' => 26,
    );

    register_post_type('hobby', $args);
}
add_action('init', 'create_hobbies_cpt');
```

4. **Save** the file
5. Go to **Settings > Permalinks** and click **Save Changes**

## Step 2: Create ACF Field Groups Manually

### A) Skills Field Group

1. Go to **Custom Fields > Field Groups**
2. Click **Add New**
3. Set **Title**: `Skill Fields`
4. Add one field:
   - **Field Label**: `Short Description`
   - **Field Name**: `short_description`
   - **Field Type**: `Textarea`
   - **Instructions**: `Brief description of this skill or technology`
   - **Required**: Yes
   - **Rows**: 3

5. **Location Rules**:
   - Show this field group if **Post Type** is equal to **skill**

6. **Settings** (scroll down):
   - Check **Show in GraphQL**: Yes
   - **GraphQL Field Name**: `skillFields`

7. **Publish**

### B) Hobbies Field Group

1. Click **Add New** (new field group)
2. Set **Title**: `Hobby Fields`
3. Add one field:
   - **Field Label**: `Description`
   - **Field Name**: `description`
   - **Field Type**: `Textarea`
   - **Instructions**: `Detailed description of this hobby or interest`
   - **Required**: Yes
   - **Rows**: 4

4. **Location Rules**:
   - Show this field group if **Post Type** is equal to **hobby**

5. **Settings**:
   - Check **Show in GraphQL**: Yes
   - **GraphQL Field Name**: `hobbyFields`

6. **Publish**

### C) About Page Field Group

1. Click **Add New** (new field group)
2. Set **Title**: `About Page Fields`
3. Add these fields in order:

#### Tab 1: Hero Section
- **Field Type**: `Tab`
- **Field Label**: `Hero Section`

#### Hero Title
- **Field Label**: `About Hero Title`
- **Field Name**: `about_hero_title`
- **Field Type**: `Text`
- **Default Value**: `About Edris Husein`

#### Hero Subtitle
- **Field Label**: `About Hero Subtitle`
- **Field Name**: `about_hero_subtitle`
- **Field Type**: `Textarea`
- **Rows**: 2
- **Default Value**: `Full-stack developer passionate about creating exceptional digital experiences`

#### Hero Image
- **Field Label**: `About Hero Image`
- **Field Name**: `about_hero_image`
- **Field Type**: `Image`
- **Return Format**: `Image Array`

#### Tab 2: Experience Section
- **Field Type**: `Tab`
- **Field Label**: `Experience Section`

#### Experience Section Title
- **Field Label**: `Experience Section Title`
- **Field Name**: `experience_section_title`
- **Field Type**: `Text`
- **Default Value**: `Experience`

#### Experience Items
- **Field Label**: `Experience Items`
- **Field Name**: `experience_items`
- **Field Type**: `Repeater`
- **Layout**: `Table`
- **Button Label**: `Add Experience`

**Sub Fields** (click "Add Sub Field" for each):
1. **Company Name** - Text field, required
2. **Position** - Text field, required
3. **Duration** - Text field, required
4. **Description** - Textarea field, required
5. **Technologies** - Text field, optional

#### Tab 3: Skills Section
- **Field Type**: `Tab`
- **Field Label**: `Skills Section`

#### Skills Section Title
- **Field Label**: `Skills Section Title`
- **Field Name**: `skills_section_title`
- **Field Type**: `Text`
- **Default Value**: `Skills & Technologies`

#### Selected Skills
- **Field Label**: `Selected Skills`
- **Field Name**: `selected_skills`
- **Field Type**: `Post Object`
- **Post Type**: Select `skill`
- **Allow Multiple**: Yes
- **Return Format**: `Post Object`
- **UI**: Yes

#### Tab 4: Personal Section
- **Field Type**: `Tab`
- **Field Label**: `Personal Section`

#### Personal Section Title
- **Field Label**: `Personal Section Title`
- **Field Name**: `personal_section_title`
- **Field Type**: `Text`
- **Default Value**: `Personal`

#### Personal Content
- **Field Label**: `Personal Content`
- **Field Name**: `personal_content`
- **Field Type**: `Wysiwyg Editor`

#### Personal Image
- **Field Label**: `Personal Image`
- **Field Name**: `personal_image`
- **Field Type**: `Image`
- **Return Format**: `Image Array`

#### Selected Hobbies
- **Field Label**: `Selected Hobbies`
- **Field Name**: `selected_hobbies`
- **Field Type**: `Post Object`
- **Post Type**: Select `hobby`
- **Allow Multiple**: Yes
- **Return Format**: `Post Object`
- **UI**: Yes

4. **Location Rules**:
   - Show this field group if **Page Template** is equal to **Default Template**

5. **Settings**:
   - Check **Show in GraphQL**: Yes
   - **GraphQL Field Name**: `aboutPageFields`

6. **Publish**

## Step 3: Create Sample Content

### Skills:
1. Go to **Skills > Add New**
2. Create these skills:
   - **Title**: `React` | **Short Description**: `A JavaScript library for building user interfaces`
   - **Title**: `Next.js` | **Short Description**: `React framework for production-grade applications`
   - **Title**: `TypeScript` | **Short Description**: `JavaScript with syntax for types`
   - **Title**: `WordPress` | **Short Description**: `Content management system and headless CMS`

### Hobbies:
1. Go to **Hobbies > Add New**
2. Create these hobbies:
   - **Title**: `Reading` | **Description**: `Enjoying books on technology, philosophy, and fiction`
   - **Title**: `Photography` | **Description**: `Capturing moments and exploring creative composition`
   - **Title**: `Gaming` | **Description**: `Playing strategy and adventure games`

### About Page:
1. Go to **Pages > About** (create if doesn't exist)
2. Fill in the ACF fields:
   - **Hero Section**: Add title, subtitle, and upload a profile image
   - **Experience Section**: Add your work experience
   - **Skills Section**: Select skills from the dropdown
   - **Personal Section**: Add personal content and select hobbies

## Step 4: Test GraphQL

1. Go to **GraphQL > GraphiQL IDE**
2. Test this query:

```graphql
query GetAboutPage {
  page(id: "about", idType: URI) {
    title
    aboutPageFields {
      aboutHeroTitle
      aboutHeroSubtitle
      selectedSkills {
        ... on Skill {
          id
          title
          skillFields {
            shortDescription
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

## Done!

This manual setup is more reliable than JSON imports and gives you full control over each field. The Next.js app should now be able to fetch and display all the about page content correctly!