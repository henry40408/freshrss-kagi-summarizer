<?php

class KagiSummarizerExtension extends Minz_Extension {
  public function init() {
    $this->registerTranslates();
    $this->registerHook('entry_before_display', [$this, 'addSummarizeButton']);
    Minz_View::appendScript($this->getFileUrl('script.js', 'js'), false, false, false);
    Minz_View::appendScript(_url('kagiSummarizer', 'kagiStrings'), false, true, false);
    $this->registerViews();
    $this->registerController('kagiSummarizer');
  }

  public function handleConfigureAction() {
    if (Minz_Request::isPost()) {
      $kagi_token = Minz_Request::param('kagi_token', '');
      $prefix = 'https://kagi.com/search?token=';
      if (substr($kagi_token, 0, strlen($prefix)) == $prefix) {
        $kagi_token = substr($kagi_token, strlen($prefix));
      }
      FreshRSS_Context::$user_conf->kagi_token = $kagi_token;
      FreshRSS_Context::$user_conf->save();
    }
  }

  public function addSummarizeButton(FreshRSS_Entry $entry): FreshRSS_Entry {
    $this->registerTranslates();
    $url = Minz_Url::display(array(
      'c' => 'kagiSummarizer',
      'a' => 'summarize',
      'params' => array(
        'id' => $entry->id()
    )));
    $entry->_content(
      '<p class="kagi-summary"><a class="btn" href="' . $url .'">'
      . _t('ext.kagiSummarizer.ui.summarize_button') . '</a></p>'
      . $entry->content());
    return $entry;
  }
}
