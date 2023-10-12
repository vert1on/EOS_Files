#include <eosio/eosio.hpp>
#include <eosio/singleton.hpp>
#include <eosio/system.hpp>
using namespace eosio;

CONTRACT filestorage : public contract {
public:
   using contract::contract;

   struct [[eosio::table]] File {
      uint64_t id;
      name eos_account;
      uint32_t folder_id;
      std::string file_name;
      std::string file_extension;
      std::string file_content;
      uint32_t created_at;

      uint64_t primary_key() const { return id; }
   };
   using files_table = multi_index<"files"_n, File>;


   struct [[eosio::table]] Folder {
      int64_t id;
      name eos_account;
      std::string folder_name;
      int64_t parent_folder_id;
      std::vector<uint64_t> files_ids;
      std::vector<uint64_t> folders_ids;

      int64_t primary_key() const { return id; }
   };
   using folders_table = multi_index<"folders"_n, Folder>;

   struct [[eosio::table]] LastId {
      uint64_t last_file_id = 0;
      uint64_t last_folder_id = 0;
   };
   using last_id_singleton = singleton<"lastid"_n, LastId>;

   ACTION uploadfile(name eos_account, int64_t folder_id, std::string file_name, std::string file_extension, std::string file_content) {
      require_auth(eos_account);
      uint32_t current_time = current_time_point().sec_since_epoch();

      files_table files(get_self(), eos_account.value);
      uint32_t final_folder_id = 0;
      uint32_t final_file_id = 0;
      last_id_singleton last_id_table(get_self(), get_self().value);
      auto last_id = last_id_table.get_or_create(get_self(), LastId{});

      if(folder_id == -1){
         folders_table folders(get_self(), eos_account.value);
         auto iter = folders.begin();
         auto exists = false;
         while (iter != folders.end()) {
            const auto& folder_info = *iter;
            if(folder_info.folder_name == "root") {
               auto folder_files_ids = folder_info.files_ids;
               final_file_id = last_id.last_file_id + 1;
               folder_files_ids.push_back(final_file_id);
               folders.modify(iter, get_self(), [&] (auto& row){ 
                  row.files_ids = folder_files_ids;
               });
               final_folder_id = folder_info.id;
               exists = true;
               break;
            }
            ++iter;
         }
         
         if(!exists){
            uint64_t new_folder_id = last_id.last_folder_id + 1;
            last_id.last_folder_id = new_folder_id;
            final_folder_id = new_folder_id;
            final_file_id = last_id.last_file_id + 1;
            std::vector<uint64_t> empty_vector;
            empty_vector.push_back(final_file_id);

            folders.emplace(eos_account, [&](auto& row) {
               row.id = new_folder_id;
               row.eos_account = eos_account;
               row.folder_name = "root";
               row.parent_folder_id = 0;
               row.files_ids = empty_vector;
            });
         }
      } else {
         folders_table folders(get_self(), eos_account.value);
         auto folder_iterator = folders.find(folder_id);
         check(folder_iterator != folders.end(), "Folder with this id does not exists");
         final_folder_id = folder_id;
         final_file_id = last_id.last_file_id + 1;
         const auto& folder_info = *folder_iterator;
         auto folder_files_ids = folder_info.files_ids;
         folder_files_ids.push_back(final_file_id);
         folders.modify(folder_iterator, get_self(), [&] (auto& row){ 
            row.files_ids = folder_files_ids;
         });
      }

      files.emplace(eos_account, [&](auto& row) {
         row.id = final_file_id;
         row.eos_account = eos_account;
         row.folder_id = final_folder_id;
         row.file_name = file_name;
         row.file_extension = file_extension;
         row.file_content = file_content;
         row.created_at = current_time;
      });

      last_id.last_file_id = final_file_id;
      last_id_table.set(LastId {
         .last_file_id = final_file_id,
         .last_folder_id = last_id.last_folder_id
      }, get_self());
   }

   ACTION createfolder(name eos_account, int64_t folder_id, std::string folder_name) {
      require_auth(eos_account);
      check(folder_name != "root", "Folder cannot have this name");
      folders_table folders(get_self(), eos_account.value);
      uint32_t final_folder_id = 0;
      uint32_t final_new_folder_id = 0;
      last_id_singleton last_id_table(get_self(), get_self().value);
      auto last_id = last_id_table.get_or_create(get_self(), LastId{});

      if(folder_id == -1){
         folders_table folders(get_self(), eos_account.value);
         auto iter = folders.begin();
         auto exists = false;
         while (iter != folders.end()) {
            const auto& folder_info = *iter;
            if(folder_info.folder_name == "root" && folder_info.eos_account == eos_account) {
               auto folder_folders_ids = folder_info.folders_ids;
               final_folder_id = folder_info.id;
               final_new_folder_id = last_id.last_folder_id + 1;
               folder_folders_ids.push_back(final_new_folder_id);
               folders.modify(iter, get_self(), [&] (auto& row){ 
                  row.folders_ids = folder_folders_ids;
               });
               exists = true;
               break;
            }
            ++iter;
         }
         if(!exists){
            uint64_t new_folder_id = last_id.last_folder_id + 1;
            last_id.last_folder_id = new_folder_id;
            final_folder_id = new_folder_id;
            final_new_folder_id = final_folder_id + 1;
            std::vector<uint64_t> new_vector;
            new_vector.push_back(final_new_folder_id);

            folders.emplace(eos_account, [&](auto& row) {
               row.id = new_folder_id;
               row.eos_account = eos_account;
               row.parent_folder_id = 0;
               row.folder_name = "root";
               row.folders_ids = new_vector;
            });
         }
      } else {
         folders_table folders(get_self(), eos_account.value);
         auto folder_iterator = folders.find(folder_id);
         check(folder_iterator != folders.end(), "Folder with this id does not exists");
         final_folder_id = folder_id;
         final_new_folder_id = last_id.last_folder_id + 1;
         const auto& folder_info = *folder_iterator;
         auto folder_folders_ids = folder_info.folders_ids;
         folder_folders_ids.push_back(final_new_folder_id);
         folders.modify(folder_iterator, get_self(), [&] (auto& row){ 
            row.folders_ids = folder_folders_ids;
         });
      }

      folders.emplace(eos_account, [&](auto& row) {
         row.id = final_new_folder_id;
         row.eos_account = eos_account;
         row.folder_name = folder_name;
         row.parent_folder_id =  final_folder_id;
      });

      last_id_table.set(LastId {
         .last_file_id = last_id.last_file_id,
         .last_folder_id = final_new_folder_id
      }, get_self());
   }

   ACTION deletefile(name eos_account, uint64_t file_id) {
      files_table files(get_self(), eos_account.value);
      auto file_iterator = files.find(file_id);
      check(file_iterator != files.end(), "File with this id does not exist");
      const auto& file_info = *file_iterator;
      require_auth(file_info.eos_account);

      folders_table folders(get_self(), eos_account.value);
      auto folder_iterator = folders.find(file_info.folder_id);
      const auto& folder_info = *folder_iterator;
      auto folder_files_ids = folder_info.files_ids;
      auto it = std::find(folder_files_ids.begin(), folder_files_ids.end(), file_id);
      
      while (it != folder_files_ids.end()) {
         folder_files_ids.erase(it);
         it = std::find(folder_files_ids.begin(), folder_files_ids.end(), file_id);
      }
      folders.modify(folder_iterator, get_self(), [&] (auto& row){
         row.files_ids = folder_files_ids;
      });
      files.erase(file_iterator);
   }

   ACTION editfilename(name eos_account, uint64_t id, std::string new_file_name) {
      files_table files(get_self(), eos_account.value);
      auto file_iterator = files.find(id);
      check(file_iterator != files.end(), "File with this id does not exist");
      const auto& file = *file_iterator;
      require_auth(file.eos_account);
      files.modify(file_iterator, get_self(), [&] (auto& row){
         row.file_name = new_file_name;
      });
   }
};

EOSIO_DISPATCH(filestorage, (uploadfile)(deletefile)(createfolder)(editfilename))