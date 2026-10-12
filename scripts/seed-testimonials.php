<?php
/**
 * Seed the 10 public client reviews plus the employer reference as Testimonial posts
 * (custom post type `testimonial`), then pick the seven shown ones on the Home page
 * ("Testimonials" relationship, in order).
 *
 * Run AFTER the theme with the testimonial post type (inc/post-types.php) and
 * inc/acf-fields/testimonials.php is deployed:
 *   wp eval-file seed-testimonials.php         # dry run, prints what it would write
 *   wp eval-file seed-testimonials.php apply   # writes
 *
 * Idempotent: a testimonial whose title already exists is skipped (not updated).
 * The homepage selection is only written when it is still empty. On apply the
 * rows of the old Home page repeater (testimonials_section_items*) are deleted.
 *
 * Logos and websites come from the frontend's bundled files (a testimonial named
 * Leon Heuser, Chloé Kuhlow or Guntram Bechtold reuses them), so no media upload
 * is needed.
 */

if (!function_exists('update_field')) {
    WP_CLI::error('ACF is not active.');
}
if (!post_type_exists('testimonial')) {
    WP_CLI::error('Post type "testimonial" is not registered. Deploy the theme first.');
}

$apply = in_array('apply', $args ?? array(), true);
$front_id = (int) get_option('page_on_front');
if (!$front_id) {
    WP_CLI::error('No static front page set.');
}

// title (unique, = client name in the admin list), quote, name, company, lang, shown on the homepage
$testimonials = array(
    array('Leon Heuser', "Edris is the best WordPress developer and designer I've worked with. He's quick and always finds a solution. He designs the site first and takes feedback before he builds.", 'Leon Heuser', 'Managing Director, ReviewForest', 'en', true),
    array('Chloé Kuhlow', 'Edris helped me finish my online shop in a few weeks. He kept in touch by video call the whole time and explained what he was doing and what I needed to do.', 'Chloé Kuhlow', 'Owner, Campzilla', 'en', true),
    array('Guntram Bechtold', 'Edris is an exceptional developer. His technical skills are top-notch and he communicates clearly through the whole project.', 'Guntram Bechtold', 'Founder and Managing Director, Stars Media', 'en', true),
    array('Martina Velmeden', "Edris took care of my new website and its redesign. He organised the whole move to the new platform, made it much easier and handled everything very professionally. He also helped move the site to another host. I'm glad I found him and will definitely book him again.", 'Martina Velmeden', 'Interior architect, Velmeden Atelier', 'en', true),
    array('Christoph Santner', 'I worked with Edris again on setting up a new website. He is a great web developer: absolutely reliable, on time and fast. Really outstanding work, and I can fully recommend him.', 'Christoph Santner', 'Founder, Alles KI', 'en', true),
    array('Thomas Rohner and Tom Glitzner', "Edris worked with us as a web developer on WordPress projects, including the careers site of the Vorarlberg state hospitals, and took care of the monthly maintenance and updates of our clients' websites. He always did his work reliably, on time and to our complete satisfaction, handled the maintenance we largely entrusted to him very conscientiously, and kept bringing constructive ideas to improve our development process.", 'Thomas Rohner and Tom Glitzner', 'Employer reference, Baschnegger Ammann Partner', 'en', true),
    array('bobdo', 'Edris quickly settled into a wide range of tasks: website maintenance, managing website content, building websites and front-end work in HTML and CSS. He worked independently, responsibly and carefully, stayed motivated even under a heavy workload, and always did his job to our full satisfaction.', 'bobdo', 'Employer reference, bobdo', 'en', true),
    array('Stefanie d.', "Edris is an amazing developer with great skills. He is a great communicator and knows his stuff. I'm really impressed by his skills.", 'Stefanie d.', '', 'en', false),
    array('Anonymous client (WordPress project)', 'Working with Edris was an absolute pleasure! He delivered top-notch work on my WordPress project. His professionalism and communication throughout the process were outstanding.', '', '', 'en', false),
    array('Anonymous client (highly recommended)', 'Great to work with Edris. Highly recommended.', '', '', 'en', false),
    array('Anonymous client (Squarespace move)', 'Many thanks for your in-depth support. I first wanted help moving my website off Squarespace. Then you managed and steered the project, and you always kept the overview.', '', '', 'en', false),
    array('Anonymous client (website and social media)', 'I am completely satisfied and happy with the great work Edris did setting up a complete website, including linking it to social media.', '', '', 'en', false),
    array('Anonymous client (German review)', 'Tolle Zusammenarbeit. Edris hat alle Aufgaben korrekt umgesetzt. Ich kann die Zusammenarbeit mit Edris absolut empfehlen!', '', '', 'de', false),
    array('Silvia G.', 'Great UX feedback!', 'Silvia G.', '', 'en', false),
);

$find = static function (string $title): int {
    $ids = get_posts(array(
        'post_type' => 'testimonial',
        'post_status' => array('publish', 'draft', 'pending', 'private', 'future', 'trash'),
        'title' => $title,
        'fields' => 'ids',
        'posts_per_page' => 1,
        'no_found_rows' => true,
    ));
    return $ids ? (int) $ids[0] : 0;
};

$shown_ids = array();
$shown_total = count(array_filter($testimonials, function ($t) { return $t[5]; }));
$created = 0;
foreach ($testimonials as $index => $t) {
    list($title, $quote, $name, $company, $lang, $shown) = $t;
    $id = $find($title);
    if ($id) {
        WP_CLI::log("Skip (exists, #$id): $title");
    } elseif (!$apply) {
        WP_CLI::log("Would create: $title" . ($shown ? ' (shown on the homepage)' : ''));
    } else {
        $id = wp_insert_post(array(
            'post_type' => 'testimonial',
            'post_status' => 'publish',
            'post_title' => $title,
            'menu_order' => $index + 1,
        ), true);
        if (is_wp_error($id)) {
            WP_CLI::error("Could not create $title: " . $id->get_error_message());
        }
        update_field('field_testimonial_quote', $quote, $id);
        update_field('field_testimonial_name', $name, $id);
        update_field('field_testimonial_company', $company, $id);
        update_field('field_testimonial_lang', $lang, $id);
        $created++;
        WP_CLI::log("Created #$id: $title");
    }
    if ($shown && $id) {
        $shown_ids[] = (int) $id;
    }
}

// Logos and websites for the named testimonials. Logos come as PNG from the live
// frontend (deploy the frontend first; WordPress refuses SVG uploads). Only empty
// fields are filled, so editing them in WP admin is never overwritten.
$brands = array(
    'Leon Heuser' => array('reviewforest.png', 'ReviewForest', 'https://reviewforest.org/'),
    'Chloé Kuhlow' => array('campzilla-wordmark.png', 'Campzilla', 'https://campzilla-shop.com/'),
    'Guntram Bechtold' => array('starsmedia.png', 'Stars Media', 'https://www.starsmedia.com/'),
    'Martina Velmeden' => array('velmeden-atelier.png', 'Velmeden Atelier', 'https://velmeden-atelier.de/'),
    'Christoph Santner' => array('alleski.png', 'Alles KI', 'https://alleski.com/'),
    'Thomas Rohner and Tom Glitzner' => array('bap.png', 'Baschnegger Ammann Partner', 'https://www.bap.cc/'),
    'bobdo' => array('bobdo.png', 'bobdo', 'https://bobdo.com/'),
);
$logo_base = 'https://edrishusein.com/images/clients/';
foreach ($brands as $title => $brand) {
    list($file, $alt, $site) = $brand;
    $id = $find($title);
    if (!$id) {
        continue;
    }
    $has_logo = (bool) get_field('field_testimonial_logo', $id, false);
    $has_site = (string) get_field('field_testimonial_website_url', $id, false) !== '';
    if (!$apply) {
        WP_CLI::log("$title: " . ($has_logo ? 'logo set' : "would add logo $file") . ', ' . ($has_site ? 'website set' : "would add $site"));
        continue;
    }
    if (!$has_site) {
        update_field('field_testimonial_website_url', $site, $id);
    }
    if (!$has_logo) {
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        $media_id = media_sideload_image($logo_base . $file, $id, $alt . ' logo', 'id');
        if (is_wp_error($media_id)) {
            WP_CLI::warning("$title: logo not added (" . $media_id->get_error_message() . '). The site still shows the bundled logo.');
        } else {
            update_post_meta($media_id, '_wp_attachment_image_alt', $alt);
            update_field('field_testimonial_logo', $media_id, $id);
            WP_CLI::log("$title: logo #$media_id added");
        }
    }
}

// Group subfields are stored as testimonials_section_<name>.
$has_selection = !empty(get_post_meta($front_id, 'testimonials_section_testimonials', true));

global $wpdb;
$legacy_like = $wpdb->esc_like('testimonials_section_items');
$legacy_rows = (int) $wpdb->get_var($wpdb->prepare(
    "SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE post_id = %d AND (meta_key LIKE %s OR meta_key LIKE %s)",
    $front_id,
    $legacy_like . '%',
    '\_' . $legacy_like . '%'
));

if (!$apply) {
    WP_CLI::log('Homepage selection: ' . ($has_selection ? 'already set, left as is.' : 'would pick the seven shown testimonials in order.'));
    WP_CLI::log("Old repeater meta rows on page $front_id: $legacy_rows (would be deleted).");
    WP_CLI::log('Dry run. Add "apply" to write.');
    return;
}

if ($has_selection) {
    WP_CLI::log('Homepage selection already set, left as is.');
} elseif (count($shown_ids) === $shown_total) {
    $section = get_field('testimonials_section', $front_id);
    update_field('field_testimonials_section', array(
        'field_testimonials_section_title' => (string) ($section['section_title'] ?? '') ?: 'What clients say',
        'field_testimonials_prev_label' => (string) ($section['prev_label'] ?? '') ?: 'Prev',
        'field_testimonials_next_label' => (string) ($section['next_label'] ?? '') ?: 'Next',
        'field_testimonials_section_testimonials' => $shown_ids,
    ), $front_id);
    WP_CLI::log('Homepage selection set to #' . implode(', #', $shown_ids) . '.');
} else {
    WP_CLI::warning('Found ' . count($shown_ids) . ' of the ' . $shown_total . ' shown testimonials. Homepage selection not written.');
}

if ($legacy_rows > 0) {
    $wpdb->query($wpdb->prepare(
        "DELETE FROM {$wpdb->postmeta} WHERE post_id = %d AND (meta_key LIKE %s OR meta_key LIKE %s)",
        $front_id,
        $legacy_like . '%',
        '\_' . $legacy_like . '%'
    ));
    clean_post_cache($front_id);
    WP_CLI::log("Deleted $legacy_rows old repeater meta rows from page $front_id.");
}

$picked = (array) get_post_meta($front_id, 'testimonials_section_testimonials', true);
WP_CLI::success("Created $created testimonials. Page $front_id now picks: #" . implode(', #', $picked) . '.');
